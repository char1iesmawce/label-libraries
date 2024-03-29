/*
  Decode functions should return a structure which can contain the following parts:
  return {
  pretty_name : "Nicely formatted full name to override automatic version",
  pretty_sn_code : "Nicely formatted serial number (with dashes to separate subblocks)",
  pretty_sn_meaning : "Meaning of the serial number field"
  }
*/

function decodeEngine(major_type, sub_type, sncode){
    return null;
}

function decodeTiles(major_Type, sub_type, sncode){
    const plate=sncode.substring(0,4)
    const rv=sncode.substring(4,5)
    const sn=sncode.substring(5,8)
    const pretty_sn=`${plate}-${rv}-${sn}`
    const pretty_sn_text=`Plate ${plate}, Reel/Magazine ${rv}, S/N ${sn}`
    return {
	    pretty_sn_code : pretty_sn,
	    pretty_sn_meaning : pretty_sn_text
    }
}

register_new_decoder("EL", decodeEngine)
register_new_decoder("TC", decodeTiles)
