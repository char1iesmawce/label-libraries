const barcode_decode_map = new Map();

function register_new_decoder() {
    if (arguments.length == 2) {
        const major_type = arguments[0];
        const func = arguments[1];
        if (barcode_decode_map.has(major_type)) {
            const current = barcode_decode_map.get(major_type);
            current.major_decode_func = func;
            barcode_decode_map.set(major_type, current);
        } else {
            barcode_decode_map.set(major_type, {
                major_decode_func: func
            });
        }
    } else if (arguments.length == 3) {
        const major_type = arguments[0];
        const sub_type = arguments[1];
        const func = arguments[2];
        let current = null
        if (barcode_decode_map.has(major_type)) {
            current = barcode_decode_map.get(major_type);
            if (!Object.hasOwn(current, "subtype_decoder_funcs")) {
                current.subtype_decoder_funcs = new Map();
            }

        } else {
            current = {
                subtype_decoder_funcs: new Map()
            };
        }
        current.subtype_decoder_funcs.set(sub_type, func);
        barcode_decode_map.set(major_type, current);
    }
}

class ScanResult {
    constructor(is_ok, text, major_code, major_name, sub_code, sub_name, sn_code, sn_text) {
        this.is_ok = is_ok;
        this.major_name = major_name;
        this.sub_name = sub_name;
        this.major_code = major_code;
        this.sub_code = sub_code;
        this.sn_code = sn_code;
	this.sn_text = sn_text;
	this.fmt_label = `320-${major_code}-${sub_code}-${sn_code}`
        this.text = text;
    }
}

function getDecoded(major_type, sub_type, sn_code) {
    if (!barcode_decode_map.has(major_type)) {
        return null;
    }
    const mt = barcode_decode_map.get(major_type);
    if (Object.hasOwn(mt, "subtype_decoder_funcs") && mt.subtype_decoder_funcs.has(sub_type)) {
        return mt.subtype_decoder_funcs.get(sub_type)(major_type, sub_type, code);
    } else if (Object.hasOwn(mt, "major_decode_func")) {
        return mt.major_decode_func(major_type, sub_type, sn_code);
    }
    return null
}

function decodeHGCALBarcode(raw_barcode, configuration) {
    const failed = new ScanResult(false, `Barcode ${raw_barcode} is not a known HGCAL barcode.`, )
    if (raw_barcode.length !== 15) {
        return failed;
    }

    const major_type_code = raw_barcode.substring(3, 5);
    const major_type = Object.entries(configuration).find(
        pair => {
            console.log(pair[1]['major_code']);
            return pair[1]['major_code'] === major_type_code;
        }
    );
    if (major_type_code === undefined) {
        return failed;
    }
    const [major_name, major_data] = major_type;

    const sub_type = Object.entries(
        major_data["subtypes"]).find(
        ([_, st]) => raw_barcode.substring(5).startsWith(st["sub_code"]));

    if (sub_type === undefined) {
        return failed;
    }
    const [sub_name, sub_data] = sub_type;

    console.log(sub_type)
    console.log(sub_data)
    let sn_code = raw_barcode.substring(5 + sub_data["sub_code"].length);
    let sn_text = sn_code;
    let text=""

    let pretty = getDecoded(major_data.major_code, sub_data.sub_code, sn_code);
    console.log(pretty)
    if (pretty !== null) {
	if ("pretty_name" in pretty) {
	    text=pretty.pretty_name
	}
	if ("pretty_sn_code" in pretty) {
	    sn_code=pretty.pretty_sn_code
	}
	if ("pretty_sn_meaning" in pretty) {
	    sn_text=pretty.pretty_sn_meaning
	}
    }
    
    return new ScanResult(true,
			  text,
			  major_data.major_code,
			  major_name,
			  sub_data.sub_code,
			  sub_name,
			  sn_code,
			  sn_text)
}
