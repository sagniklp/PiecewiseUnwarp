

// Change this to increase or slow typing speed
// The console will type each letter at a random interval between 0ms and `speed` ms.
var speed = 20;
var cursorSpeed = 400;
var time = 0;
var prevTime = 0;

// Change this variable to change what gets typed
// var text = 'Hello, world. I am a self-typing console. Change my `speed` variable in javascript to  increase or decrease the speed at which I type. Change the `text` variable to change what is typed.';

function writeWord(word) {
    $('#text').empty();
  var _loop = function _loop(c) {
    time = Math.floor(Math.random() * speed);

    setTimeout(function () {
      $('#text').append(word[c]);
    }, prevTime + time);

    prevTime += time;

  };

  for (var c in word.split('')) {
    _loop(c);
  }
}




// writeWord(text);

// blink cursor 
window.setInterval(function () {
  $('.cursor').toggleClass('hide');
}, cursorSpeed);


var wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'rgba(255,0,0,0.5)',
  progressColor: 'purple',
  height: 200,
  minimap: true,
  normalize: true
});

var wavesurfer_up = WaveSurfer.create({
  container: '#waveform2',
  waveColor: 'rgba(0,255,0,0.5)',
  progressColor: 'blue',
  height: 200,
  normalize: true
});

var GLOBAL_ACTIONS = {
    'play': function () {
        wavesurfer.playPause();
    },

    'play2': function () {
        wavesurfer_up.playPause();
    },

    'back': function () {
        wavesurfer.skipBackward();
    },

    'forth': function () {
        wavesurfer.skipForward();
    },

    'toggle-mute': function () {
        wavesurfer.toggleMute();
    }
};


// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (e) {
        var map = {
            32: 'play',       // space
            37: 'back',       // left
            39: 'forth'       // right
        };
        var action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function (el) {
        el.addEventListener('click', function (e) {
            var action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});


// Misc
document.addEventListener('DOMContentLoaded', function () {
    // Web Audio not supported
    if (!window.AudioContext && !window.webkitAudioContext) {
        var demo = document.querySelector('#demo');
        if (demo) {
            demo.innerHTML = '<img src="/example/screenshot.png" />';
        }
    }

});



wavesurfer.on('ready', function () {
// code that runs after wavesurfer is ready
console.log('Success');
});

function createCORSRequest(method, url){
  var xhttp=new XMLHttpRequest();
  if ("withCredentials" in xhttp){
    xhttp.open(method, url, true);
  } 
  else if (typeof XDomainRequest != "undefined"){
    xhttp= new XDomainRequest();
    xhttp.open(method, url);
  }
  else{
    xhttp=null;
  }
  return xhttp;
}
// var start_time
// var end_time
// var request=createCORSRequest('get','http://localhost:8080/rand');
// if (request){
//   //request.responseType = 'json';
//   request.onload= function () {
//     time= JSON.parse(request.responseText)  // gives a json object
//     start_time=time.start_time
//     end_time=time.end_time
//   };
//   request.send()
// }

//wavesurfer.on('ready', function () {
//    wavesurfer.addRegion({id:'1',start:start_time,end:end_time, drag: true, color: "rgba(0, 10, 100, 0.1)"});
//});

wavesurfer.on('ready',function(){
    wavesurfer.enableDragSelection({color:chooseColor()})
});

function chooseColor(type_flag){
    if (type_flag==1) return 'rgba(0, 10, 100, 0.1)'
    else return 'rgba(0, 100, 10, 0.1)'
}
wavesurfer.on('region-click', function (region, e) {
    e.stopPropagation();
    // Play on click, loop on shift click
    e.shiftKey ? region.playLoop() : region.play();
});
wavesurfer.on('region-click', editAnnotation);
wavesurfer.on('region-update-end', saveRegions);
wavesurfer.on('region-removed', saveRegions);
wavesurfer.on('region-in', showNote);

wavesurfer.on('region-play', function (region) {
    region.once('out', function () {
        wavesurfer.play(region.start);
        wavesurfer.pause();
    });
});


/* Minimap plugin */
// wavesurfer.initMinimap({
//     height: 50,
//     waveColor: '#ddd',
//     progressColor: '#808000',
//     cursorColor: '#999'
// });


/* Timeline plugin */
wavesurfer.on('ready', function () {
    var timeline = Object.create(WaveSurfer.Timeline);
    timeline.init({
        wavesurfer: wavesurfer,
        container: "#wave-timeline",
        primaryLabelInterval: 10,
        secondaryLabelInterval: 10,
    });
});


/* Toggle play/pause buttons. */
var playButton = document.querySelector('#play');
var pauseButton = document.querySelector('#pause');
wavesurfer.on('play', function () {
    playButton.style.display = 'none';
    pauseButton.style.display = '';
});
wavesurfer.on('pause', function () {
    playButton.style.display = '';
    pauseButton.style.display = 'none';
});
var playButton2 = document.querySelector('#play2');
var pauseButton2 = document.querySelector('#pause2');
wavesurfer_up.on('play', function () {
    playButton2.style.display = 'none';
    pauseButton2.style.display = '';
});
wavesurfer_up.on('pause', function () {
    playButton2.style.display = '';
    pauseButton2.style.display = 'none';
});

    /**
 * Save annotations to localStorage.
 */
function saveRegions() {
    localStorage.regions = JSON.stringify(
        Object.keys(wavesurfer.regions.list).map(function (id) {
            var region = wavesurfer.regions.list[id];
            return {
                start: region.start,
                end: region.end,
                attributes: region.attributes,
                data: region.data
            };
        })
    );
}

/**
 * Edit annotation for a region.
 */
function editAnnotation (region) {
    var form = document.forms.edit;
    form.style.opacity = 1;
    form.elements.start.value = Math.round(region.start * 10) / 10,
    form.elements.end.value = Math.round(region.end * 10) / 10;
    form.elements.note.value = region.data.note || '';
    form.onsubmit = function (e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            data: {
                note: form.elements.note.value
            }
        });
        form.style.opacity = 0;
    };
    form.onreset = function () {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;
}


/**
 * Display annotation.
 */
function showNote (region) {
    if (!showNote.el) {
        showNote.el = document.querySelector('#subtitle');
    }
    showNote.el.textContent = region.data.note || 'untitled';
}

/**
 * Bind controls.
 */
GLOBAL_ACTIONS['delete-region'] = function () {
    var form = document.forms.edit;
    var regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
};

GLOBAL_ACTIONS['export'] = function () {
    window.open('data:application/json;charset=utf-8,' +
        encodeURIComponent(localStorage.regions));
};

var file_input=document.getElementById('uploadTrack');
file_input.addEventListener("change", loadNewAudio, false);

function loadNewAudio(){
    wavesurfer.loadBlob(file_input.files[0]);
}

function loadNewAudioUpload(){
    wavesurfer_up.load('https://547f3123.ngrok.io/curr_audio.wav') //change here
}

function upload_file(){
    var input=document.getElementById('uploadTrack')
    if (input.files.length == 0){
        alert("No files are selected")
    }
    else{
        wavesurfer.clearRegions()
        url='https://547f3123.ngrok.io/getaudio' //change here
        var formData = new FormData();
        var request = createCORSRequest('post',url);
        var content = input.files[0];
        // console.log(content);
        formData.append("file", content);
        formData.append("url",window.URL.createObjectURL(input.files[0]));
        formData.append("type",content.type);
        // //request.open("POST", url, true);
        if (request){
            request.open('post',url, true);
            request.send(formData);
            request.onload= function () {
                //console.log(request.responseText)
                obj= JSON.parse(request.responseText);  // gives a json object
                var resp=obj.msg;
                writeWord(resp);
                var start_time=obj.start_time;
                var end_time=obj.end_time;
                var sil_start_time=obj.sil_start_time;
                var sil_end_time=obj.sil_end_time;
                var disf_sil_start_time=obj.disf_sil_start_time;
                var disf_sil_end_time=obj.disf_sil_end_time;

                for (var i=0;i <start_time.length; i++ ){
                    wavesurfer.addRegion({id:i,start:start_time[i],end:end_time[i], drag: true, color: "rgba(0, 10, 100, 0.1)"});
                }

                for (var i=0;i <sil_start_time.length; i++ ){
                    wavesurfer.addRegion({id:i+1000,start:sil_start_time[i],end:sil_end_time[i], drag: true, color: "rgba(0, 100, 0, 0.1)"});
                }

                for (var i=0;i <disf_sil_start_time.length; i++ ){
                    wavesurfer.addRegion({id:i+2000,start:disf_sil_start_time[i],end:disf_sil_end_time[i], drag: true, color: "rgba(200, 0, 0, 0.1)"});
                }

                loadNewAudioUpload();

                //wavesurfer.addRegion({id:'1',start:start_time,end:end_time, drag: true, color: "rgba(0, 10, 100, 0.1)"});
                // document.getElementById("file_upload_text").innerHTML = resp;
                // console.log(wavesurfer.regions.list);
            };
        }
    }
};


function classify_sample(filename){
    
    wavesurfer.clearRegions()
    url='https://547f3123.ngrok.io/getsample' //change here
    var formData = new FormData();
    var request = createCORSRequest('post',url);
    // var content = input.files[0];
    // console.log(content);
    // formData.append("file", content);
    formData.append("filename",filename);
    formData.append("type",'audio/wav');
    // //request.open("POST", url, true);
    if (request){
        request.open('post',url, true);
        request.send(formData);
        request.onload= function () {
            //console.log(request.responseText)
            obj= JSON.parse(request.responseText);  // gives a json object
            var resp=obj.msg;
            writeWord(resp);
            var start_time=obj.start_time;
            var end_time=obj.end_time;
            var sil_start_time=obj.sil_start_time;
            var sil_end_time=obj.sil_end_time;
            var disf_sil_start_time=obj.disf_sil_start_time;
            var disf_sil_end_time=obj.disf_sil_end_time;

            for (var i=0;i <start_time.length; i++ ){
                wavesurfer.addRegion({id:i,start:start_time[i],end:end_time[i], drag: true, color: "rgba(0, 10, 100, 0.1)"});
            }

            for (var i=0;i <sil_start_time.length; i++ ){
                wavesurfer.addRegion({id:i+1000,start:sil_start_time[i],end:sil_end_time[i], drag: true, color: "rgba(0, 100, 0, 0.1)"});
            }

            for (var i=0;i <disf_sil_start_time.length; i++ ){
                wavesurfer.addRegion({id:i+2000,start:disf_sil_start_time[i],end:disf_sil_end_time[i], drag: true, color: "rgba(200, 0, 0, 0.1)"});
            }

            loadNewAudioUpload();

            //wavesurfer.addRegion({id:'1',start:start_time,end:end_time, drag: true, color: "rgba(0, 10, 100, 0.1)"});
            // document.getElementById("file_upload_text").innerHTML = resp;
            // console.log(wavesurfer.regions.list);
        };
    }
    
};

function loadsample1(){
  // load file into wavesurfer
  wavesurfer.load('https://547f3123.ngrok.io/sample_1.wav')  //change here
  
  var labelTag=document.getElementById( 'file-label' );
  labelTag.innerHTML = "Sample 1";
  // Call classifier 
  classify_sample('sample_1.wav')
};
function loadsample2(){
  // load file into wavesurfer
  wavesurfer.load('https://547f3123.ngrok.io/sample_2.wav') //change here

  var labelTag=document.getElementById( 'file-label' );
  labelTag.innerHTML = "Sample 2";

  // Call classifier 
  classify_sample('sample_2.wav')

};
function loadsample3(){
  // load file into wavesurfer
  wavesurfer.load('https://547f3123.ngrok.io/sample_3.wav') //change here

  var labelTag=document.getElementById( 'file-label' );
  labelTag.innerHTML = "Sample 3";

  // Call classifier 
  classify_sample('sample_3.wav')

};
function loadsample4(){
  // load file into wavesurfer
  wavesurfer.load('https://547f3123.ngrok.io/sample_4.wav') //change here
  var labelTag=document.getElementById( 'file-label' );
  labelTag.innerHTML = "Sample 4";

  // Call classifier 
  classify_sample('sample_4.wav')
};


