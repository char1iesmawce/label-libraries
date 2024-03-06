let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader()
let running=false;

function setResult(result){
    if (!result.is_ok) {
        var innerhtml = `<p>${result.text}</p>`;
        document.getElementById('result-area').classList.add("has-background-danger-light");
    }
    else {
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
        document.getElementById('result-area').classList.remove("has-background-danger-light");
        
    }
    document.getElementById('result-area').innerHTML = innerhtml;

}

function startDecode(){
    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
            console.log(result)
            const scan_result = decodeHGCALBarcode(result.text, barcode_configuration);
            setResult(scan_result);
            running=false;
            setState(running)
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err)
            document.getElementById('result-area').textContent = err;
        }
    })
}





function setState(run){
    if(run){
        document.getElementById('result-area').innerHTML = 'Please Scan Your Barcode';
        document.getElementById('toggleButton').textContent = 'Stop';
        document.getElementById('result-area').classList.remove("has-background-danger-light");
        running=true;
        startDecode()
    } else {
        running=false;ssl_context='adhoc'
        codeReader.reset()
        document.getElementById('toggleButton').textContent = 'Start';
        console.log('Reset.')
    }
}

document.getElementById('toggleButton').addEventListener('click', () => {
    setState(!running);
})


codeReader.listVideoInputDevices()
    .then((videoInputDevices) => {
        running = true;
        const sourceSelect = document.getElementById('sourceSelect')
        selectedDeviceId = videoInputDevices[0].deviceId

        console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
        startDecode()
    })
    .catch((err) => {
        console.error(err)
        document.getElementById('result-area').textContent = err;
    })
