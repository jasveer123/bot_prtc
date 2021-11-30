const {WaterfallDialog , ComponentDialog, ThisPath} = require("botbuilder-dialogs")

const {ConfirmPrompt , ChoicePrompt , DateTimePrompt , NumberPrompt  , TextPrompt} = require('botbuilder-dialogs')

const {getid, deleteid } = require('../api/axios')

const { getreservationcard } = require('../Resources/adaptivCard/reservationcard')


const { CardFactory } = require('botbuilder');


const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { getActiveDialogContext } = require("botbuilder-dialogs/lib/dialogHelper");
//const { get } = require("../router/ticketroute");
const CONFIRM_PROMPT = 'CONFIRM_PROMPT'
const CHOICE_PROMPT = 'CHOICE_PROMPT'
const DATETIME_PROMPT = 'DATETIME_PROMPT'
const NUMBER_PROMPT = 'NUMBER_PROMPT'
const TEXT_PROMPT = 'TEXT_PROMPT'
const WATERFALL_DIALOG = 'WATERFALL_DIALOG'
var endDialog ='';



class cancelTicket extends ComponentDialog {
    constructor(conservsationState,userState){
    super('cancelTicket');

    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.addDialog(new TextPrompt(TEXT_PROMPT));
   


    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [ 

       this.enterId.bind(this),
       this.sure.bind(this),
       this.summary.bind(this)

               
    ]));

    this.initialDialogId = WATERFALL_DIALOG;


    }
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
    
        const DialogContext = await dialogSet.createContext(turnContext);
        const results = await DialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await DialogContext.beginDialog(this.id);
        }
    }

  

    async enterId (step){

        endDialog = false;

        
            return await step.prompt(TEXT_PROMPT, 'enter the ticket id which you want to cancel')
        }

  

    async sure(step){
        step.values.id=step.result;

          
        
        const data =  await getid(step)
       console.log("1")
        console.log(data)
       console.log("2")

        await step.context.sendActivity({
            text: 'Here is following details associated with this id',
            attachments: [CardFactory.adaptiveCard(getreservationcard(data.name, data.date, data.time , data.location, data.destination , data.noOfParticipants ,data._id))]
        });

        return await step.prompt(CONFIRM_PROMPT, 'Are you sure ?', ['yes', 'no'])
    }
    async summary(step){
    
        if(step.result===true)
        {
          // Business 
          const Del = deleteid(step)
    
          await step.context.sendActivity(" Ticket  successfully cancel. Your reservation cancel ")
          endDialog = true;
          return await step.endDialog();   
        
        }
    }

    async isDialogComplete(){
        return endDialog;
    }
    
}

module.exports.cancelTicket = cancelTicket;