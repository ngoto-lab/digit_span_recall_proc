  //----- CUSTOMIZABLE VARIABLES -----------------------------------------

    nTrials = 14 // number of trials in the test
    minSetSize = 3 // starting digit length
    stimuli_duration = 1000 // number of miliseconds to display each digit
    recall_duration = null // number of miliseconds to allow recall. If null, there is no time limit.
    file_name = null // file name for data file. if null, a default name consisting of the participant ID and a unique number is chosen.
    local = false // save the data file locally.
              // If this test is being run online (e.g., on MTurk), true will cause the file to be downloaded to the participant's computer.
              // If this test is on a server, and you wish to save the data file to that server, change this to false.
              // If changed to false, ensure that the php file (its in the directory!) and the empty "data" folder has also been appropriately uploaded to the server.
              // Incase of problems, feel free to contact me :)

  //----------------------------------------------------------------------

  possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]  //possible digits participants can get

  var selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)  //chooses random digits
  var selection_id = -1

  // keeps track of participant's scores:
  var nError = 0
  var highest_span_score = 0
  var consec_error_score = 0

  // first page. identifies participant for data storage
  var p_details = {
    type:"survey-text",
    questions: [{prompt: "1日目の実験で報告した確認コードを半角数字で入力してください"}],
    on_finish:function(){
      partN = jsPsych.data.get().last(1).values()[0].partNum
      partN = partN.replace(/['"]+/g,'')
//      console.log(partN[0])
    }
  }

// instruction page
var instructions = {
    type: 'instructions',
    pages: function(){
      pageOne = "<div style='font-size:20px;'><b>課題の説明</b><br><br>もう一度数字を覚えてもらいますが、今度は逆の順序で数列を入力してもらいます。詳しく説明しますので注意してお読みください。<br><br><br>この課題では、スクリーンに1つずつ表示される数列を覚えてください。<br>数列が最後まで表示されると、数字を入力するパッドがスクリーンに表示されるので、パッドをクリックして、表示されたのとは<strong>逆の順序</strong>で数列を入力してください。<br>次の画面で、入力した回答の正誤が表示されます。正解であれば緑色の文字で「<span style='color:rgb(0 220 0)'>正解です</span>」が、誤りであれば赤色の文字で「<span style='color:rgb(240 0 0)'>不正解です</span>」が表示されます。<br><u>例:</u> もし '7 4 5 1'という順序で数字が表示されたら、 '1 5 4 7'という順序で回答画面に入力してください。<br><br>課題中はメモなどは取らずに覚えてください。<br>課題のイメージをつかんでいただくために、これから、練習課題をやっていただきます。<br> 'スタート！' のボタンをクリックして練習課題を始めてください。<br><br></div>"
      return [pageOne]
    },
    allow_backward: false,
    button_label_next: "スタート！",
    show_clickable_nav: true
  }

  var instructions_node = {
      type: 'instructions',
      pages: function(){
        pageOne = "<div style='font-size:20px;'>練習課題が終わりました。 <br>次から本番が始まります。<br>  'スタート！' ボタンをクリックして本番を始めてください。<br><br></div>"
        return [pageOne]
      },
      allow_backward: false,
      button_label_next: "スタート!",
      show_clickable_nav: true,
      on_finish: function(){
        minSetSize = 3
        selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
      }
    }

var test_stimuli = {
  type: 'html-keyboard-response',
  stimulus: function(){
    selection_id+=1
    return '<div style="font-size:70px;">'+selection[selection_id]+'</div>'
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: stimuli_duration,
  on_finish: function(){
    if (selection_id + 1 >=selection.length){
      jsPsych.endCurrentTimeline()
    }
  }
}

var recall = {
  type: 'digit-span-recall',
  correct_order: function(){
    return selection.reverse();
    console.log(selection.reverse())
  },
  trial_duration: recall_duration,
  on_finish: function(){
    acc = jsPsych.data.get().last(1).values()[0].accuracy;
    if (acc==1){
      if (highest_span_score < minSetSize){
        highest_span_score = minSetSize
        }
        minSetSize+=1
        nError = 0
    } else if (nError < 1) { // checks for number of consecutive errors
      nError += 1
    } else {
      if (consec_error_score < minSetSize){
        consec_error_score = minSetSize
      }
      minSetSize = Math.max( 3, minSetSize-1)
      }
    if (minSetSize<=8){ // bottom code prevents immediate repition of digits
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
    } else {
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, 8)
      var extra = minSetSize-8
      var id = possibleNumbers.indexOf(selection[7])
      possibleNumbers.splice(id, 1);
      var extraNumbers= jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, extra)
      selection = selection.concat(extraNumbers)
      possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    }
    selection_id = -1
  }
}

var feedback = {
  type: 'html-keyboard-response',
  stimulus: function(){
    var text = ""
    var accuracy = jsPsych.data.get().last(1).values()[0].accuracy
    if (accuracy==1){
      text += '<div style="font-size:35px; color:rgb(0 220 0)"><b>正解です</div>'
    } else {
      text += '<div style="font-size:35px; color:rgb(240 0 0)"><b>不正解です</div>'
    }
    //text += '<div style="font-size:30px; color:rgb(0 0 0)"><br><br>New trial starting now.</div>'
    return text
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000
}

var conclusion = {
  type: 'html-keyboard-response',
  stimulus: function(){
    return '<div style="font-size:20px;">これで課題は終了です。<br>Thank you for your participation in this task.<br><br>Maximum number of digits recalled correctly was ' + highest_span_score +'.<br><br>Maximum number of digits reached before making two consecutive errors was ' +consec_error_score+'.<br><br>Please tell the Research Assistant you have completed the task.</div>'
},
  choices: jsPsych.NO_KEYS
//  trial_duration:1000
}

  var test_stack = {
    timeline: [test_stimuli],
    repetitions: 17
  }

  var test_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: nTrials
  }

  var demo_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: 3
  }

function saveData(filename, filedata){
      $.ajax({
            type:'post',
            cache: false,
            url: 'save_data.php', // this is the path to the above PHP script
            data: {filename: filename, filedata: filedata}
      });
};

var IDsub = Date.now()

/*var dataLog = {
 type: 'html-keyboard-response',
 stimulus: " ",
 trial_duration: 100,
 on_finish: function(data) {
    var data = jsPsych.data.get().filter({trial_type: 'digit-span-recall'});
    if (file_name == null){
      file_name = "WM_digit_span_"+partN+"_"+IDsub.toString()+".csv"}
    else{
      file_name += ".csv"
    }
    if (local){
      data.localSave('csv', file_name )
    } else {
      saveData(file_name, data.csv());
    }
  }
}*/


var exp_end = {
      type: 'html-button-response',
      timing_post_trial: 0,
      choices: ['ここをクリックして次のページに進む'],
      on_trial_start: function() {setTimeout(function() {setDisplay("jspsych-btn","")}, 500)},  
      is_html: true,
      stimulus: 'この課題は以上です。下のボタンをクリックしてください。',
      data: function () {
          return {};
      },
    }
var timeline = [];
//timeline = [p_details]

timeline = timeline.concat([instructions, demo_procedure, instructions_node, test_procedure, exp_end])
