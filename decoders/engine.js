function decodeEngine(major_type, sub_type, code){
    return `This is an engine with code ${code}`
}

register_new_decoder("EL", decodeEngine)
