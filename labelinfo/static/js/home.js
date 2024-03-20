const codeReader = new ZXing.BrowserMultiFormatReader()

let running = false;
let video_device_id = null;


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

function startDecode() {
    codeReader.reset();
    running = true;
    console.log(`Started continous decode from camera with id ${video_device_id}`)
    codeReader.decodeFromVideoDevice(video_device_id, 'video', (result, err) => {
        if (result) {
            console.log(result)
            const scan_result = decodeHGCALBarcode(result.text, barcode_configuration);
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
        videoInputDevices.forEach((element) => {
            const sourceOption = document.createElement('option')
            sourceOption.text = element.label
            sourceOption.value = element.deviceId
            selection.appendChild(sourceOption)
        })
        selection.onchange = (x) => {

            running=true;
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

}

navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(init)

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
    }

    function pointerdownHandler(ev) {
        event_cache.push(ev);
    }

    function pointermoveHandler(ev) {
        const index = event_cache.findIndex(
            (cev) => cev.pointerId === ev.pointerId,
        );
        event_cache[index] = ev;
        if (event_cache.length === 2) {
            const diff = Math.abs(event_cache[0].clientX - event_cache[1].clientX);
            if (prev_diff > 0 && (diff !== prev_diff)) {
                func(diff);
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

function getStreamCapability(stream, capability){
    const [track] = [window.track] = stream.getVideoTracks();
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    if( !( capability  in settings)){
        return null;
    }
    return capabilities[capability];
}

function zoomStreamBy(stream, val){

    try {
        const constraints = {advanced: [{"zoom": value}]};
        await track.applyConstraints(constraints);
    } catch (err) {
        console.error('applyConstraints() failed: ', err);
    }
}
