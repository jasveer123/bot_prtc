const mongooose = require("mongoose")

const ticket_schema= new mongooose.Schema({
    name:{type:String,require:true},
    noOfParticipants:{type:Number,require:true},
    location:{type:String ,require:true},
    destination:{type:String,require:true},
    date:{type:String, require:true},
    time:{type:String, require:true}

})

const ticket_menu = new mongooose.model("Ticket",ticket_schema)

module.exports = ticket_menu;