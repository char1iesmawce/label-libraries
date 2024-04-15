let running = false;
let video_device_id = null;
let current_stream = null;
let current_zoom = null;

const hints = new Map();
const formats = [ZXing.BarcodeFormat.DATA_MATRIX];
hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
const codeReader = new ZXing.BrowserMultiFormatReader()



function registerPinch(el, func){
    const event_cache = [];
    let prev_diff = -1;


    function removeEvent(ev) {
        const index = event_cache.findIndex(
            (cachedEv) => cachedEv.pointerId === ev.pointerId,
        );
        event_cache.splice(index, 1);
    }

    function pointerupHandler(ev) {
        removeEvent(ev);
        if (event_cache.length < 2) {prev_diff = -1;}
        ev.target.style.background = "white";
        ev.target.style.border = "1px solid black";
    }

    function pointerdownHandler(ev) {
        event_cache.push(ev);
        //document.getElementById('result-area').innerHTML = `HERE0: ${event_cache.length}`;
    }

    function pointermoveHandler(ev) {
        ev.target.style.border = "dashed";
        const index = event_cache.findIndex(
            (cev) => cev.pointerId === ev.pointerId,
        );
        event_cache[index] = ev;
        if (event_cache.length === 2) {
            const diff = Math.abs(event_cache[0].clientX - event_cache[1].clientX);
            if (prev_diff > 0 && (diff !== prev_diff)) {
                document.getElementById('result-area').innerHTML = `HERE0: ${current_stream}`;
                func(diff - prev_diff);
            }
            prev_diff = diff;
        }
    }

    el.onpointerdown = pointerdownHandler;
    el.onpointermove = pointermoveHandler;
    el.onpointerup = pointerupHandler;
    el.onpointercancel = pointerupHandler;
    el.onpointerout = pointerupHandler;
    el.onpointerleave = pointerupHandler;

}

function getTrackCapability(track, capability){
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    if( !( capability  in settings)){
        return null;
    }
    return capabilities[capability];
}

async function zoomTrackTo(track, value){
    try {
        const constraints = {advanced: [{"zoom": value}]};
        console.log(constraints)
        await track.applyConstraints(constraints);
    } catch (err) {
        console.error('applyConstraints() failed: ', err);
    }
    return 
}




function setResult(result) {
    if (!result.is_ok) {
        var innerhtml = `<p>${result.text}</p>`;
        document.getElementById('result-area').classList.add("has-background-danger-light");
    } else {
        var innerhtml = ` <h1>${result.fmt_label}</h1>
                          <table class="table is-fullwidth is-bordered is-narrow">
                            <thead>
                                <tr>
                                    <th class="has-text-centered">Field</th>
                                    <th class="has-text-centered">Value</th>
                                    <th class="has-text-centered">Meaning</th>
                                </tr>
                                <tr>
                                    <td class="has-text-centered">Major Type</a>
                                    <td class="has-text-centered"> ${result.major_code} </td>
                                    <td class="has-text-centered"> ${result.major_name} </td>
                                <tr>
                                    <td class="has-text-centered">Subtype</a>
                                    <td class="has-text-centered">  ${result.sub_code} </td>
                                    <td class="has-text-centered">  ${result.sub_name} </td>
                               </tr>
                                <tr>
                                    <td class="has-text-centered">Serial Code</a>
                                    <td class="has-text-centered"> ${result.sn_code} </td>
                                    <td class="has-text-centered"> ${result.sn_text} </td>
                               </tr>
                            </thead>
                        </table>`;
        if (result.text !== null) {
            innerhtml += `
                        <div>
                        ${result.text}
                        </div>
`
        }
        document.getElementById('result-area').classList.remove("has-background-danger-light");

    }
    document.getElementById('result-area').innerHTML = innerhtml;

}

async function startDecode() {
    codeReader.reset();
    running = true;
    console.log(`Started continous decode from camera with id ${video_device_id}`)
    const video_constraints = { deviceId: { exact: video_device_id } };

    const zoom_input = document.getElementById("zoom-slider");
    
    const constraints = { video: video_constraints };


    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    current_stream = stream;

    const [track] = stream.getVideoTracks();
    if(zoom_input.value > 100) {
        zoomTrackTo(track, zoom_input.value / 100);
    }
    console.log(track);
    zoom_input.oninput = async event => { await zoomTrackTo(track, zoom_input.value / 100)};

    codeReader.decodeFromStream(current_stream, 'video', (result, err) => {
        if (result) {
            console.log(result)
            try{
                var scan_result = decodeHGCALBarcode(result.text, barcode_configuration);
            } catch (e) {
                console.log("Barcode decoding failed");
                console.log(e);
                var scan_result = new ScanResult(false, `Was not able to decode barcode "${result.text}".`)
            }
            running = false;
            setPageState();
            codeReader.reset();
            setResult(scan_result);
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err)
            document.getElementById('result-area').textContent = err;
        }
    })
}

function setPageState() {
    if (running) {
        document.getElementById('result-area').innerHTML = 'Please Scan Your Barcode';
        document.getElementById('toggleButton').textContent = 'Stop';
        document.getElementById('result-area').classList.remove("has-background-danger-light");
    } else {
        document.getElementById('toggleButton').textContent = 'Start';
    }
}

document.getElementById('toggleButton').addEventListener('click', () => {
    running = !running;
    if(running){
        startDecode();
    }
    else {
        codeReader.reset()
    }
    setPageState();
})


async function pinchCallback(val){

    document.getElementById('result-area').innerHTML = `HERE1: ${current_stream}`;
    if(current_stream === null){
        return;
    }
    console.log(current_stream);
    const [track] = current_stream.getVideoTracks();
    console.log(track);
    const settings = track.getSettings();
    const cur_zoom = settings["zoom"];
    current_zoom = current_zoom + val;
    document.getElementById('result-area').innerHTML = `HERE2: ${current_zoom}`;
    await zoomTrackTo(track, current_zoom);
    //const x = getTrackCapability(track, "zoom");
    //console.log(x);
}

function init(){
    codeReader.listVideoInputDevices().then((videoInputDevices) => {
        const device_str  = videoInputDevices.map(x=>x.deviceId).join("\n");
        if(videoInputDevices.length === 0 ){
            document.getElementById('result-area').innerHTML = 'No Cameras Found';
            document.querySelector('.video-wrapper').style.display = "none";
            document.querySelector('#toggleButton').style.display = "none";
            document.querySelector('#source-select-div').style.display = "none";
            return 
        }
        const selection = document.getElementById('source-select')
        videoInputDevices.sort((a,b) => b.label.includes("Back"));
        videoInputDevices.forEach((element) => {
            const sourceOption = document.createElement('option')
            sourceOption.text = element.label
            sourceOption.value = element.deviceId
            selection.appendChild(sourceOption)
        })
        selection.onchange = (x) => {

            running=true;
            const zoom_input = document.getElementById("zoom-slider");
            zoom_input.value = 100;
            setPageState();
            video_device_id = selection.value;
            startDecode();
        };
        video_device_id = videoInputDevices[0].deviceId;
        startDecode()
    }
                                           )
        .catch((err) => {
            console.error(err)
            document.getElementById('result-area').textContent = err;
        })


    //registerPinch(document.getElementById("video"), pinchCallback)

}

navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(init)

