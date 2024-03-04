let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader()
let running=false;


class ScanResult{
    constructor(is_ok, text, major_type, sub_type, code){
        this.is_ok = is_ok;
        this.major_type = major_type;
        this.sub_type = sub_type;
        this.code = code;
        this.text = text;
    }
}

function startDecode(){
    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
            console.log(result)
            const scan_result = decodeHGCALBarcode(result.text);
            if(!scan_result.is_ok){
                document.getElementById('result-area').classList.toggle("has-background-danger");
            }
            document.getElementById('result').textContent = scan_result.text
            running=false;
            setState(running)
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err)
            document.getElementById('result').textContent = err
        }
    })
}


function setState(run){
    if(run){
        document.getElementById('result').textContent = '';
        document.getElementById('toggleButton').textContent = 'Stop';
        document.getElementById('result-area').classList.remove("has-background-danger");
        running=true;
        startDecode()
    } else {
        running=false;
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
    })
