class ScanResult{
    constructor(is_ok, text, major_type, sub_type, code){
        this.is_ok = is_ok;
        this.major_type = major_type;
        this.sub_type = sub_type;
        this.code = code;
        this.text = text;
    }
}

function decodeHGCALBarcode(raw_barcode, configuration){
    const failed = new ScanResult(false, `Barcode ${raw_barcode} is not a known HGCAL barcode.`, )
    if (raw_barcode.size !== 15) return failed;

    const major_type_code = raw_barcode.substring(3,6);
    const major_type = Object.entries(configuration)
          .find(
              pair =>
              return pair[1]['major_sn'] === major_type_code);
    if (major_type_code === undefined ) return failed;

    const sub_type  = Object.entries(major_type["subtypes"],
                                     ([_, st]) =>
                                     return raw_barcode.substring(6).startswith(st["sub_sn"]));

    if (sub_type === undefined ) return failed;

    const code = raw_barcode.substring(6 + sub_typ[1]["sub_sn"].length);

    return new ScanResult(true,
                          `Major Type: ${major_type[0]}. Subtype: ${subtype[0]}. Code ${code}`,
                          major_type[0],
                          sub_type[0],
                          code)
}
