class ScanResult{
    constructor(is_ok, text, major_code, major_name, sub_code, sub_name, code){
        this.is_ok = is_ok;
        this.major_name = major_name;
        this.sub_name = sub_name;
        this.major_code = major_code;
        this.sub_code = sub_code;
        this.code = code;
        this.text = text;
    }
}

function decodeHGCALBarcode(raw_barcode, configuration){
    const failed = new ScanResult(false, `Barcode ${raw_barcode} is not a known HGCAL barcode.`, )
    if (raw_barcode.length !== 15){ return failed ; }

    const major_type_code = raw_barcode.substring(3,5);
    const major_type = Object.entries(configuration).find(
        pair => {
            console.log(pair[1]['major_code']);
            return pair[1]['major_code'] === major_type_code;
        }
    );
    if (major_type_code === undefined ){ return failed; }
    const [major_name, major_data] = major_type;
    

    const sub_type  = Object.entries(
        major_data["subtypes"]).find(
        ([_, st]) => raw_barcode.substring(5).startsWith(st["sub_code"]));

    if (sub_type === undefined ){ return failed;}
    const [sub_name, sub_data] = sub_type;

    console.log(sub_type)
    console.log(sub_data)
    const code = raw_barcode.substring(5 + sub_data["sub_code"].length);

    return new ScanResult(true,
                          `Major Type: ${major_name}. Subtype: ${sub_name}. Code ${code}`,
                          major_data.major_code,
                          major_name,
                          sub_data.sub_code,
                          sub_name,
                          code)
}
