const { WaterfallDialog, ComponentDialog } = require("botbuilder-dialogs")

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs')
const {postid} = require('../api/axios')
const {getdetails} = require('../api/axios')

const { getreservationcard } = require('../Resources/adaptivCard/reservationcard')

const { summarycard } = require('../Resources/adaptivCard/summarycard')

const { CardFactory } = require('botbuilder');

const {mailto} = require('../email/nodemailer');

//const {store} = require('../controller/ticketcontroller')
//require("../dbs/dbs")
//const ticket_schema = require("../models/ticket")



const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const SendmailTransport = require("nodemailer/lib/sendmail-transport")
const mail = require("@sendgrid/mail")
//const loginCard = require('../Resources/adaptivCard/login.json')
const CONFIRM_PROMPT = 'CONFIRM_PROMPT'
const CHOICE_PROMPT = 'CHOICE_PROMPT'
const DATETIME_PROMPT = 'DATETIME_PROMPT'
const NUMBER_PROMPT = 'NUMBER_PROMPT'
const TEXT_PROMPT = 'TEXT_PROMPT'
const WATERFALL_DIALOG = 'WATERFALL_DIALOG'
var endDialog = '';

/*let CARD =[
    loginCard

]*/

class reservationDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('reservationDialog');

        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));



        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            //this.login.bind(this),
            this.firstStep.bind(this),
            this.getName.bind(this),
            this.getNumberOfParticipants.bind(this),
            this.GetLocation.bind(this),
            this.GetDestination.bind(this),
            this.getDate.bind(this),
            this.getTime.bind(this),
            this.getmail.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)

        ]));

        this.initialDialogId = WATERFALL_DIALOG;


    }
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        console.log('1')
        dialogSet.add(this);
        console.log('2')

        const DialogContext = await dialogSet.createContext(turnContext);
        console.log('3')
        const results = await DialogContext.continueDialog();
        console.log('4')
        if (results.status === DialogTurnStatus.empty) {
            await DialogContext.beginDialog(this.id);
        }
    }

   /* async login(step){

        await step.context.sendActivity({
            text: 'reservation done here is ticket',
            attachments: [CardFactory.adaptiveCard(CARD[0])]
        });
    }*/

    async firstStep(step) {
        endDialog = false;

        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CONFIRM_PROMPT, 'Would you like to book ticket?', ['yes', 'no']);

    }

    async getName(step) {
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'on what name Ticket should be made?');
        }

    }

    async getNumberOfParticipants(step) {

        step.values.name = step.result
        return await step.prompt(NUMBER_PROMPT, 'How many participants ( 1 - 150)?');
    }

    async GetLocation(step) {

        step.values.noOfParticipants = step.result
        return await step.prompt(TEXT_PROMPT, 'Enter your near prtc bus stand');


    }

    async GetDestination(step) {
        step.values.location = step.result;
        return await step.prompt(TEXT_PROMPT, 'Enter Destination prtc bus stand');

    }

    async getDate(step) {

        step.values.destination = step.result;

        return await step.prompt(DATETIME_PROMPT, 'On which date you want to make the reservation?')
    }

    async getTime(step) {

        step.values.date = step.result

        return await step.prompt(DATETIME_PROMPT, 'At what time?')
    }

    async getmail(step){
        step.values.time = step.result
        return await step.prompt(TEXT_PROMPT, 'Enter Your mail address')
    }


    async confirmStep(step) {

        step.values.mail = step.result
        
        await step.context.sendActivity({
            text: 'You entered following information',
            attachments: [CardFactory.adaptiveCard(summarycard(step.values.name.toUpperCase(), step.values.date[0].value, step.values.time[0].value, step.values.location.toUpperCase(), step.values.destination.toUpperCase(), step.values.noOfParticipants))]
        });
        return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to make the reservation?', ['yes', 'no']);
         

    }

    async summaryStep(step) {

        console.log(step.values)
        
        const ticket_details = await postid(step)
       
        const detials = await getdetails(step)

        if (step.result === true) {
            // Business 
            await step.context.sendActivity({
                text: 'reservation done here is ticket',
                attachments: [CardFactory.adaptiveCard(getreservationcard(step.values.name.toUpperCase(), step.values.date[0].value, step.values.time[0].value, step.values.location.toUpperCase(), step.values.destination.toUpperCase(), step.values.noOfParticipants, detials[0]._id.toUpperCase()))]
            });

            const sendmail = mailto(step.values.name.toUpperCase(), step.values.date[0].value, step.values.time[0].value, step.values.location.toUpperCase(), step.values.destination.toUpperCase(), step.values.noOfParticipants, detials[0]._id.toUpperCase(),step.values.mail)

           // const ticket_details = await postid(step)



            //database 
            /*let ticket = new ticket_schema({

                name:step.values.name.toUpperCase(),
                participants :step.values.noOfParticipants,
                location : step.values.location.toUpperCase(),
                destination:  step.values.destination.toUpperCase(),
                date: step.values.date[0].value,
                time: step.values.time[0].value
                
              })
            
              ticket.save()
              .then(response=>{
                  res.json({
            
                     message:"data sucessfully added"
                  })
              })
              .catch(error=>{
                  res.json({
                      message:"an error is occure"
                  })
              })*/


             

            await step.context.sendActivity(`Reservation successfully made. Your ticketid  is : ${detials[0]._id.toUpperCase()}`)
            endDialog = true;
            return await step.endDialog();

        } 






    }
    async noOfParticipantsValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 1 && promptContext.recognized.value < 150;
    }

    async isDialogComplete() {
        return endDialog;
    }

}

module.exports.reservationDialog = reservationDialog