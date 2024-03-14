const codeReader = new ZXing.BrowserMultiFormatReader()

let running = false;
let video_device_id = null;


function setResult(result) {
    if (!result.is_ok) {
        var innerhtml = `<p>${result.text}</p>`;
        document.getElementById('result-area').classList.add("has-background-danger-light");
    } else {
        var innerhtml = ` <table class="table is-fullwidth is-bordered is-narrow">
                            <thead>
                                <tr>
                                    <th class="has-text-centered"> Major Type </th>
                                    <th class="has-text-centered">Subtype</th>
                                    <th class="has-text-centered">Code</th>
                                </tr>
                                <tr>
                                    <td class="has-text-centered"> ${result.major_code} </td>
                                    <td class="has-text-centered">  ${result.sub_code} </td>
                                    <td class="has-text-centered"> ${result.code} </td>
                               </tr>
                                <tr>
                                    <td class="has-text-centered"> ${result.major_name} </td>
                                    <td class="has-text-centered">  ${result.sub_name} </td>
                                    <td class="has-text-centered"> ${result.code} </td>
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
