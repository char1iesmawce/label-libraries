function decodeHGCALBarcode(raw_barcode){
    return new ScanResult(false, `Barcode ${raw_barcode} is not a known HGCAL barcode.`)
}
