// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler , MessageFactory  } = require('botbuilder');

const {reservationDialog} = require("./componentDialogs/reservationDialog")
const {cancelTicket} = require("./componentDialogs/cancelTicket")
const { CardFactory } = require('botbuilder');
const welcomecard = require('./Resources/adaptivCard/welcomecard.json')
const CARDS = [

    welcomecard
];
// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';
const PREVIOUS_INTENT = 'previousIntent';
const CONSERVATION_DATA ='conservationData'

class RRBOT extends ActivityHandler {
    constructor(conversationState, userState) {
        super();
        // Create the state property accessors for the conversation data and user profile.
        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogState = conversationState.createProperty("dialogState");
        this.reservationDialog = new reservationDialog(this.conversationState, this.userState)
        this.cancelTicket = new cancelTicket(this.conversationState, this.userState)

        this.previousIntent = conversationState.createProperty(PREVIOUS_INTENT);
        this.conversationData = conversationState.createProperty(CONSERVATION_DATA);

        // The state management objects for the conversation and user state.
        this.conversationState = conversationState;
        this.userState = userState;

        this.onMessage(async (turnContext, next) => {
            // Get the state properties from the turn context.
            const userProfile = await this.userProfileAccessor.get(turnContext, {});
            const conversationData = await this.conversationDataAccessor.get(
                turnContext, { promptedForUserName: false });

                if (!userProfile.name) {


                // First time around this is undefined, so we will prompt user for name.
                if (conversationData.promptedForUserName) {
                    // Set the name to what the user provided.
                    userProfile.name = turnContext.activity.text;

                    // Acknowledge that we got their name.
                    await turnContext.sendActivity(`Hi! , ${ userProfile.name } welcome to the prtc helper bot`);
                    await this.sendSuggestionAction(turnContext)
                    // Reset the flag to allow the bot to go though the cycle again.
                }
 
                
                else {
                    // Prompt the user for their name.
                    await turnContext.sendActivity('What is your name?');

                    // Set the flag to true, so we don't prompt in the next turn.
                    conversationData.promptedForUserName = true;
                }
            }
            else{
                
               // await this.sendSuggestionAction(turnContext)
                await this.someFunction(turnContext)
                await next()
            }
            

            // By calling next() you ensure that the next BotHandler is run.
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity({
                        attachments: [CardFactory.adaptiveCard(CARDS[0])],
                    });
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
    
    
    async sendSuggestionAction(turnContext){
        await turnContext.sendActivity("what would you like to do")
        const reply = MessageFactory.suggestedActions(["Bookticket", "cancelTicket", "view Reservation","Get help"]);
        await turnContext.sendActivity(reply);
    }

    async someFunction(context){

        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{});   

        if(previousIntent.intentName && conversationData.endDialog === false )
        {
           currentIntent = previousIntent.intentName;

        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
             currentIntent = context.activity.text;

        }
        else
        {
            currentIntent = context.activity.text;
            await this.previousIntent.set(context,{intentName: context.activity.text});

        }

        switch(currentIntent)
        {
    
            case 'Bookticket':
            console.log("Inside Make Reservation Case");
            await this.conversationData.set(context,{endDialog: false});
            await this.reservationDialog.run(context,this.dialogState);
            conversationData.endDialog = await this.reservationDialog.isDialogComplete();
            if(conversationData.endDialog)
            {
                await this.sendSuggestionAction(context);

    
            }
            
            break;

            case 'cancelTicket':
            console.log("Inside cancel Reservation Case");
            await this.conversationData.set(context,{endDialog: false});
            await this.cancelTicket.run(context,this.dialogState);
            conversationData.endDialog = await this.cancelTicket.isDialogComplete();
            if(conversationData.endDialog)
            {
                await this.sendSuggestionAction(context);
    
            }
            
            break;
    
            default:
                console.log("Did not match Make Reservation case");
                break;
        }


    }

    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.RRBOT = RRBOT;
