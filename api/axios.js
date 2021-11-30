const axios = require('axios');
const request = require('request');



module.exports.getid = async (step) => {
   


       res = await axios.get(`http://localhost:7000/ticket/${step.values.id}`)

        const data = res.data;
        return data;
}

module.exports.getdetails = async (step) =>{

   
  const params ={
    name:`${step.values.name.toUpperCase()}`,
   noOfParticipants :`${step.values.noOfParticipants}`,
    location:`${step.values.location.toUpperCase()}`,
    destination:`${step.values.destination.toUpperCase()}` ,
    date: `${step.values.date[0].value}`,
    time: `${step.values.time[0].value}`
}  

    console.log(params)
    res = await axios.get("http://localhost:7000/ticket",{params})

    const data = res.data;
    return data;
    
}



module.exports.postid = async (step) => {

  const params ={
            name:`${step.values.name.toUpperCase()}`,
           noOfParticipants :`${step.values.noOfParticipants}`,
            location:`${step.values.location.toUpperCase()}`,
            destination:`${step.values.destination.toUpperCase()}` ,
            date: `${step.values.date[0].value}`,
            time: `${step.values.time[0].value}`
        }   

    rep = await axios.post("http://localhost:7000/ticket", params)
    const data1 = rep.data;
    return data1
}


module.exports.deleteid = (step) =>{
   
   // const params = {id:`${step.values.id}`}
    //console.log(step.values.id)
    res = axios.delete(`http://localhost:7000/ticket/${step.values.id}`)
    .then(res =>{
         console.log(res.data)
    })
    .catch(err=>{
        console.log(err)
    })
   
    const data2 = res.data;
    return data2

}


