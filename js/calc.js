// FACTORIAL GAMMA FUNCTION (FOR FRACTIONS)

// ADD ENGAGE_SCIENTIFIC_NOTATION IF NUMBER IS TOO BIG
// continuing to press equal should continue operations

// remove leading comma from negative numbers

function param(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
}

const SCREEN_BREAKPOINT = 645;
const SMALL_SCREEN_SIZE = 9;
const LARGE_SCREEN_SIZE = 16;

// added by Respondus - Trac #2516
const LAYOUT_DYNAMIC = 0;
const LAYOUT_BASIC_ONLY = 1;
const LAYOUT_SCIENTIFIC_ONLY = 2;


var mode = param('mode');

if (mode == 'BASIC') {

    setTimeout(function() {setLayoutType(LAYOUT_BASIC_ONLY);}, 200);
}
if (mode == 'SCIENTIFIC') {

    setTimeout(function() {setLayoutType(LAYOUT_SCIENTIFIC_ONLY);}, 200);    
}


// added by Respondus - Trac #2516
var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';


$("#copy-value").on( clickOrTouch, function() {
    calcCopyButton();
    //setLayoutType( LAYOUT_SCIENTIFIC_ONLY );
});
$("#paste-value").on( clickOrTouch, function() {
    setTimeout(function() { calcPasteButton();}, 1000);
    
    //setLayoutType( LAYOUT_BASIC_ONLY );
});

function calcCopyButton() {
    // Get the text field
    var copyText = $("#input-output").text();
    console.log("val = " + copyText);

  
    // Select the text field
    //copyText.select();
    //copyText.setSelectionRange(0, 99999); // For mobile devices
  
     // Copy the text inside the text field
    navigator.clipboard.writeText(copyText);
  }

  function calcPasteButton() {

    $("#testtext").select();
    
    //copyText.setSelectionRange(0, 99999); // For mobile devices
    status = document.execCommand("paste");
    //var outval = navigator.clipboard.readText();

    

    /*
    
    navigator.clipboard
    .readText()
    .then((clipText) => ($("#input-output").text(clipText)));
    */
    
  }

function maxScreenLength(){ // DIGITS
    if(screenSizeSetting === "small-screen") {
        return SMALL_SCREEN_SIZE;
    } else if(screenSizeSetting === "big-screen"){
        return LARGE_SCREEN_SIZE;
    }
    console.log("THERE HAS BEEN AN ERROR!");
}

function currentNumberLength(num){
    return num.toString().split("").length;
}

function removeExcessDigits(inputString){
    var max = maxScreenLength(),
    arr = inputString.toString().split(""),
    output = "";
    
    if( arr.length <= max ){
        return inputString;
    } else if (arr.length > max) {
        // modified by Respondus - Trac #2516
        //for( var i = 0; i <= max; i++ ) {
        //    output += arr[i];
        //}
        output = Number( inputString ).toExponential();
        arr = output.toString().split("");
        var n = 4;
        while (n < 8 && arr.length > max) {
            n++;
            output = Number( inputString ).toExponential( max - n );
            arr = output.toString().split("");
        }
    }
    return output;
}

// added by Respondus - Trac #2516
var layoutType = LAYOUT_DYNAMIC;
//var layoutType = LAYOUT_BASIC_ONLY;
//var layoutType = LAYOUT_SCIENTIFIC_ONLY;



// added by Respondus - Trac #2516
function setLayoutType( layout ) {
	
	layoutType = layout;
	manageScreenSize();
}
// added by Respondus - Trac #2516
function setLayoutTypeFromRequest() {
	
	var layoutParam = getRequestParameter("layout");
	
	if (layoutParam == false) {
		return;
	}
	if (layoutParam == "dynamic") {
		setLayoutType( LAYOUT_DYNAMIC );
	}
	if (layoutParam == "basic") {
		setLayoutType( LAYOUT_BASIC_ONLY );
	}
	if (layoutParam == "scientific") {
		setLayoutType( LAYOUT_SCIENTIFIC_ONLY );
	}

    
}
// added by Respondus - Trac #2516
function getRequestParameter( name ) {
    
    var q = document.location.search;
    var i = q.indexOf(name + '=');

    if (i == -1) {
        return false;
    }
    var r = q.substr(i + name.length + 1, q.length - i - name.length - 1);
    i = r.indexOf('&');

    if (i != -1) {
        r = r.substr(0, i);
    }
    return r.replace(/\+/g, ' ');
}


/// SCREEN AREA
// ALWAYS ADD TO RESET
var storedInput             = "0",
    previouslyStoredInput   = "0",
    requestedOperation      = "",
    allClear                = "AC";

var decimalExists = false;

var requestPlaced = false;

var output = "";

var screenSizeSetting = "big-screen";

var radianMode = false;
var secondSettingMode = false;
var memoryRecallValue = 0;

var parenthesisMode = false;
var parenthesisRecord = []; // [[origin value, requestedOperation]]

/// END SCREEN AREA

function prepareForOperations(operation){
    if( requestPlaced === false ){     // first time operator button gets pressed
        requestPlaced = true;
        decimalExists = false;
        previouslyStoredInput = storedInput;
        storedInput = "0";
        requestedOperation = operation
        printOutput(true);
    } else if ( requestPlaced === true ){
        requestedOperation = operation;
    }
}


function engageReset() {
    storedInput                 = "0";
    previouslyStoredInput       = "0";
    requestPlaced = false;      // operation (+,-,/,*) hasbeen requested
    decimalExists = false;
    requestedOperation = "";
    allClear                    = "AC";
    parenthesisMode = false;
    parenthesisRecord = [];
    $("#reset-button").text("AC");
}

function setAllClear() {
    $("#reset-button").text("C");
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a /b;
}

function turnNegative(a) {
    return -1 * a;
}

function factorial(a) {
    if(a <= 1){ return 1;}
    return a * factorial(a-1);
}

function customLog(a,b) {
    return Math.log(a) / Math.log(b);   
}



function resetOperations() {
    requestPlaced = false;
}

function engageOperationEngine(){
    switch(requestedOperation) {
        case "+":
            storedInput = ( add( Number(previouslyStoredInput), Number(storedInput) ) ).toString();
            break;
        case "-":
            storedInput = ( subtract( Number(previouslyStoredInput), Number(storedInput) ) ).toString();
            break;
        case "*":
            storedInput = ( multiply( Number(previouslyStoredInput), Number(storedInput) ) ).toString();
            break;
        case "/":
            storedInput = ( divide( Number(previouslyStoredInput), Number(storedInput) ) ).toString();
            break;
        case "EE":
            storedInput = ( Number(previouslyStoredInput) * Math.pow(10, Number(storedInput) ) ).toString();
            break;
        case "customroot":
            storedInput = (Math.pow(Number(previouslyStoredInput), 1/(Number(storedInput)) )).toString();
            break;              
        case "customexp":
            storedInput = (Math.pow(Number(previouslyStoredInput), (Number(storedInput)) )).toString();
            break;
        case "reverse-customexp":
            storedInput = (Math.pow(Number(storedInput), (Number(previouslyStoredInput)) )).toString();
            break;
        case "custom-logarithm":
            storedInput = (customLog(Number(previouslyStoredInput),Number(storedInput) )).toString();
            break;           
        default:
            storedInput = storedInput;
    }
    resetOperations();
}


function engageCalculatorEngine(input) {

    const decinplace = storedInput.indexOf('.') !== -1;

    console.log("requestPlaced: " + requestPlaced);
    console.log("input: " + input);
    console.log("decimalExists: " + decimalExists);
    console.log("storedInput: " + storedInput);

    if(requestPlaced === true){
        if (currentNumberLength(storedInput) >= maxScreenLength() ){                      // if no more digits can fit on screen
            storedInput = storedInput;
        } else if ( currentNumberLength(storedInput) < maxScreenLength() ) {              // if more digits can fit on screen
            if( Number.isInteger(Number(storedInput)) && !decimalExists ){
                storedInput = ( (Number(storedInput) * 10) + input ).toString();
            } //else if ( Number.isInteger(Number(storedInput)) && decimalExists ) {
                else if ( !decinplace && decimalExists ) {
                storedInput = storedInput + "." + input.toString();
                
            } else if ( decimalExists ) {
                storedInput += input.toString();
            }
        }   
        printOutput();
       
       
       
        
    } else if(requestPlaced === false){

        if (currentNumberLength(storedInput) >= maxScreenLength() ){                      // if no more digits can fit on screen
            storedInput = storedInput;
        } else if ( currentNumberLength(storedInput) < maxScreenLength() ) {              // if more digits can fit on screen
            if( Number.isInteger(Number(storedInput)) && !decimalExists ){
                storedInput = ( (Number(storedInput) * 10) + input ).toString();
            } //else if ( Number.isInteger(Number(storedInput)) && decimalExists ) {
                else if ( !decinplace && decimalExists ) {
                storedInput = storedInput + "." + input.toString();    
                console.log("stored=" + storedInput);            
            } else if ( decimalExists ) {
                storedInput += input.toString();
            }
        }

        printOutput();
    }
}


function addCommas(input) {
    var decimalExists       = false,
        foundDecimal        = false,
        rightOfDecimalCount = 0,
        numberIsNegative    = false,
        arr                 = input.toString().split(""),
        output              = [];

    if(arr[0] === "-") {
        arr.shift();
        numberIsNegative = true;
    }
        
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] == "." ){
            decimalExists = true;
        }
    }    
    
    for(var j = arr.length - 1; j >= 0; j--){
        if(decimalExists){
            if( foundDecimal ){
                if( (rightOfDecimalCount % 3 === 0) && rightOfDecimalCount !== 0){
                        output.unshift(",");
                }
                rightOfDecimalCount++;
                output.unshift(arr[j]);
            } else {
                if(arr[j] == ".") {
                    foundDecimal = true;
                }
                output.unshift(arr[j]);
            }
            
        } else {
            if( (rightOfDecimalCount % 3 === 0) && rightOfDecimalCount !== 0){
                    output.unshift(",");
            }
            rightOfDecimalCount++;
            output.unshift(arr[j]);
        }
    }
    if (numberIsNegative) {
        output.unshift("-");
    }
    return output.join("");
}


function printOutput(operationPrint){
    const decinplace = storedInput.indexOf('.') !== -1;
    if(operationPrint){
        output = previouslyStoredInput;
    } else {
        if( !decinplace && decimalExists ){
            output = storedInput.toString() + ".";
        }
        else {
            output = storedInput;    
        }        
    }
    /*** added by Respondus for testing - Trac #2516
    $("#input-output-debug-result").text(output);
    $("#input-output-debug-exp").text(Number(output).toExponential());
    ***/
    output = addCommas( removeExcessDigits(output) );
    $("#input-output").text(output);
    $("#hidden-input-output").text(output);
    
}

/*** modified by Respondus - Trac #2516
function manageScreenSize(){
    if( $(window).width() <= SCREEN_BREAKPOINT && screenSizeSetting == "big-screen" ){
        screenSizeSetting = "small-screen";
        $(".big-screen").toggle();
        returnToFirstSetting();
        radianMode = false;
        $("#rad-display").text("");
        $("#rad-button").text("Rad");        
        
    } else if ( $(window).width() > SCREEN_BREAKPOINT && screenSizeSetting == "small-screen" ) {
        screenSizeSetting = "big-screen";
        $(".big-screen").toggle();
    }
}
***/
function manageScreenSize(){

	var useBasicLayout = false;
	var useScientificLayout = false;

	if ( layoutType == LAYOUT_DYNAMIC ) {
		
		useBasicLayout = ( $(window).width() <= SCREEN_BREAKPOINT );
		useScientificLayout = ( $(window).width() > SCREEN_BREAKPOINT );
	} else {
	
		useBasicLayout = ( layoutType == LAYOUT_BASIC_ONLY );
		useScientificLayout = ( layoutType == LAYOUT_SCIENTIFIC_ONLY );
	}
 
    if( useBasicLayout && screenSizeSetting == "big-screen" ){
        
        screenSizeSetting = "small-screen";
        $(".big-screen").toggle();
       	$("#calculator").css("min-width", "250px");
       	$("#calculator").css("max-width", "250px");
           
        $("#screen").css("width", "246px");


       	// should be necessary, but actually breaks things for some reason
       	//$(".entry-button").css("width", "25%");
        //$(".big-screen").css("width", "0px");
       	$("#number-0").css("width", "50%");
        returnToFirstSetting();
        radianMode = false;
        $("#rad-display").text("");
        $("#rad-button").text("Rad");
        
    } else if ( useScientificLayout && screenSizeSetting == "small-screen" ) {
    
        screenSizeSetting = "big-screen";
        $(".big-screen").toggle();
       	$("#calculator").css("min-width", "625px");
       	$("#calculator").css("max-width", "625px");
        $("#screen").css("width", "615px");
       	// should be necessary, but actually breaks things for some reason
       	//$(".entry-button").css("width", "10%");
       	$("#number-0").css("width", "20%");
    }
}


function returnToFirstSetting(){
    $('#e-to-the-x-button').html("e<sup>x</sup>");      //  e^x     -   y^x
    $('#ten-to-the-x-button').html("10<sup>x</sup>");   //  10^x    -   2^x
    $('#log-base-e-button').html("ln");                 //  ln      -   log-base-y
    $('#log-base-10-button').html("log<sub>10</sub>");  //  log10   -   log-base-2
    $('#sin-button').html("sin");                       //  sin     -   sin^-1
    $('#cos-button').html("cos");                       //  cos     -   cos^-1
    $('#tan-button').html("tan");                       //  tan     -   tan^-1
    $('#sinh-button').html("sinh");                     //  sinh    -   sinh^-1
    $('#cosh-button').html("cosh");                     //  cosh    -   cosh^-1
    $('#tanh-button').html("tanh");                     //  tanh    -   tanh^-1
} 

function returnToSecondSetting(){
    $('#e-to-the-x-button').html("y<sup>x</sup>");       //  e^x     -   y^x
    $('#ten-to-the-x-button').html("2<sup>x</sup>");     //  10^x    -   2^x
    $('#log-base-e-button').html("log<sub>y</sub>");     //  ln      -   log-base-y
    $('#log-base-10-button').html("log<sub>2</sub>");    //  log10   -   log-base-2
    $('#sin-button').html("sin<sup>-1</sup>");           //  sin     -   sin^-1
    $('#cos-button').html("cos<sup>-1</sup>");           //  cos     -   cos^-1
    $('#tan-button').html("tan<sup>-1</sup>");           //  tan     -   tan^-1
    $('#sinh-button').html("sinh<sup>-1</sup>");         //  sinh     -   sinh^-1
    $('#cosh-button').html("cosh<sup>-1</sup>");         //  cosh     -   cosh^-1
    $('#tanh-button').html("tanh<sup>-1</sup>");         //  tanh     -   tanh^-1    

}



document.addEventListener('copy', function(e) {
    e.preventDefault(); // Prevent the default copy action
    if (e.clipboardData) {
        const text = window.getSelection().toString(); // Get the selected text
        e.clipboardData.setData('text/plain', text); // Set the clipboard data to plain text
    }
});



$( document ).ready(function(){

    

    // Begin Manage Screensize //////////////////////////////////
    manageScreenSize();
    
    $(window).resize( function(){
        console.log($(window).width());
        manageScreenSize();
    });
    // End Manage Screensize //////////////////////////////////


    
    // added by Respondus - Trac #2516
    $("#input-output").bind("paste", function(e){
        // access the clipboard using the api
        var pastedData = e.originalEvent.clipboardData.getData('text');
        engageCalculatorEngine(Number(pastedData));
        setAllClear();
    } );

    
                    
                    
                    
    // modified by Respondus - Trac #2516
    //$("#number-0").click(function(){
    $("#number-0").on( clickOrTouch, function(){
        engageCalculatorEngine(0);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "0" ){
            engageCalculatorEngine(0);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-1").click(function(){
    $("#number-1").on( clickOrTouch, function(){
        engageCalculatorEngine(1);
        setAllClear();
    });

    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "1" ){
            engageCalculatorEngine(1);
            setAllClear();            
        }
    });
    
    // modified by Respondus - Trac #2516
    //$("#number-2").click(function(){
    $("#number-2").on( clickOrTouch, function(){
        engageCalculatorEngine(2);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "2" ){
            engageCalculatorEngine(2);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-3").click(function(){
    $("#number-3").on( clickOrTouch, function(){
        engageCalculatorEngine(3);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "3" ){
            engageCalculatorEngine(3);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-4").click(function(){
    $("#number-4").on( clickOrTouch, function(){
        engageCalculatorEngine(4);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "4" ){
            engageCalculatorEngine(4);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-5").click(function(){
    $("#number-5").on( clickOrTouch, function(){
        engageCalculatorEngine(5);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "5" ){
            engageCalculatorEngine(5);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-6").click(function(){
    $("#number-6").on( clickOrTouch, function(){
        engageCalculatorEngine(6);
        setAllClear();
    });

    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "6" ){
            engageCalculatorEngine(6);
            setAllClear();            
        }
    });

    // modified by Respondus - Trac #2516
    //$("#number-7").click(function(){
    $("#number-7").on( clickOrTouch, function(){
        engageCalculatorEngine(7);
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "7" ){
            engageCalculatorEngine(7);
            setAllClear();            
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#number-8").click(function(){
    $("#number-8").on( clickOrTouch, function(){
        engageCalculatorEngine(8);
        setAllClear();
    });    
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "8" ){
            engageCalculatorEngine(8);
            setAllClear();            
        }
    });    

    // modified by Respondus - Trac #2516
    //$("#number-9").click(function(){
    $("#number-9").on( clickOrTouch, function(){
        engageCalculatorEngine(9);
        setAllClear();
    });

    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "9" ){
            engageCalculatorEngine(9);
            setAllClear();            
        }
    });
    
    // modified by Respondus - Trac #2516
    //$("#reset-button").click(function(){
    $("#reset-button").on( clickOrTouch, function(){
        engageReset();
        printOutput();
    });
    
    $(document).keydown(function(event){
        if(event.keyCode === 46 ){
            engageReset();
            printOutput();          
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#decimal-point").click(function(){
    $("#decimal-point").on( clickOrTouch, function(){
        if (currentNumberLength(storedInput) < maxScreenLength() ){
            decimalExists = true;
        }
        setAllClear();
        printOutput();
    });
    
    $(document).keydown(function(event){
        if(event.keyCode === 110 ){
            if (currentNumberLength(storedInput) < maxScreenLength() ){
                decimalExists = true;
            }
            setAllClear();
            printOutput();       
        }
    });        

    // modified by Respondus - Trac #2516
    //$("#calculate-button").click(function(){
    $("#calculate-button").on( clickOrTouch, function(){
        engageOperationEngine();
        requestPlaced = false;
        printOutput();
    });
    
    $(document).keydown(function(event){
        if(event.keyCode === 13 ){
            engageOperationEngine();
            requestPlaced = false;
            printOutput();       
        }
    });            
    
    
    // modified by Respondus - Trac #2516
    //$("#add-button").click(function(){
    $("#add-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }
        prepareForOperations("+");
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "+" ){
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }            
            prepareForOperations("+");
            setAllClear();            
        }
    });    

    // modified by Respondus - Trac #2516
    //$("#subtract-button").click(function(){
    $("#subtract-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }        
        prepareForOperations("-");
        setAllClear();
    });

    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "-" ){
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }                
            prepareForOperations("-");
            setAllClear();     
        }
    });
    
    // modified by Respondus - Trac #2516
    //$("#multiplication-button").click(function(){
    $("#multiplication-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }        
        prepareForOperations("*");
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "*" ){
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }               
            prepareForOperations("*");
            setAllClear();     
        }
    });    

    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "x" ){
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }               
            prepareForOperations("*");
            setAllClear();     
        }
    });

    // modified by Respondus - Trac #2516
    //$("#division-button").click(function(){
    $("#division-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }                
        prepareForOperations("/");
        setAllClear();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "/" ){
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }                    
            prepareForOperations("/");
            setAllClear();     
        }
    });    
    
    // modified by Respondus - Trac #2516
    //$("#make-negative-button").click(function(){
    $("#make-negative-button").on( clickOrTouch, function(){
        storedInput = (-1 * storedInput).toString();
        printOutput();
    });
    
    // modified by Respondus - Trac #2516
    //$("#percent-button").click(function(){
    $("#percent-button").on( clickOrTouch, function(){
        storedInput = (storedInput / 100).toString();
        printOutput();
    });
    
    $(document).keypress(function(event){
        if(String.fromCharCode(event.keyCode) === "%" ){
            storedInput = (storedInput / 100).toString();
            printOutput(); 
        }
    });    










    // modified by Respondus - Trac #2516
    //$("#set-parenthesis").click(function(){
    $("#set-parenthesis").on( clickOrTouch, function(){
        if ( requestPlaced === true ){
            parenthesisRecord.push([previouslyStoredInput, requestedOperation]);
            previouslyStoredInput = "0";
            requestPlaced = false;
            decimalExists = false;
            requestedOperation = "";
            storedInput = "0";
            printOutput();            
        }
    });

    // modified by Respondus - Trac #2516
    //$("#close-parenthesis").click(function(){
    $("#close-parenthesis").on( clickOrTouch, function(){
        console.log(parenthesisRecord);
        if (parenthesisRecord.length > 0) {
            engageOperationEngine();
            var lastKnownDemand = parenthesisRecord.pop();
            previouslyStoredInput = lastKnownDemand[0];
            requestedOperation = lastKnownDemand[1];
            engageOperationEngine();
    
            printOutput();
        }
    });






    // modified by Respondus - Trac #2516
    //$("#memory-clear").click(function(){
    $("#memory-clear").on( clickOrTouch, function(){
        memoryRecallValue = 0;
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#memory-add").click(function(){
    $("#memory-add").on( clickOrTouch, function(){
        memoryRecallValue += Number(storedInput);
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#memory-subtract").click(function(){
    $("#memory-subtract").on( clickOrTouch, function(){
        memoryRecallValue -= Number(storedInput);
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#memory-recall").click(function(){
    $("#memory-recall").on( clickOrTouch, function(){
        storedInput = ( memoryRecallValue ).toString();
        printOutput();
    });














    // modified by Respondus - Trac #2516
    //$("#second-setting-button").click(function(){
    $("#second-setting-button").on( clickOrTouch, function(){
        if(secondSettingMode){
            secondSettingMode = false;
            returnToFirstSetting();
        } else {
            secondSettingMode = true;
            returnToSecondSetting();
        }
    });































    // modified by Respondus - Trac #2516
    //$("#second-power-button").click(function(){
    $("#second-power-button").on( clickOrTouch, function(){
        storedInput = ( Math.pow(Number(storedInput),2 ) ).toString();
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#third-power-button").click(function(){
    $("#third-power-button").on( clickOrTouch, function(){
        storedInput = ( Math.pow(Number(storedInput),3 ) ).toString();
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#x-to-the-y-button").click(function(){
    $("#x-to-the-y-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }               
        prepareForOperations("customexp");
    });

    // modified by Respondus - Trac #2516
    //$("#e-to-the-x-button").click(function(){
    $("#e-to-the-x-button").on( clickOrTouch, function(){
        if(secondSettingMode) { // y ^ x
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }               
            prepareForOperations("reverse-customexp");
        } else {
            storedInput = ( Math.exp(Number(storedInput)) ).toString();
            printOutput();
        }
    });

    // modified by Respondus - Trac #2516
    //$("#ten-to-the-x-button").click(function(){
    $("#ten-to-the-x-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            storedInput = ( Math.pow(2,Number(storedInput)) ).toString();
            printOutput();            
        } else {
            storedInput = ( Math.pow(10,Number(storedInput)) ).toString();
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#inverse-button").click(function(){
    $("#inverse-button").on( clickOrTouch, function(){
        storedInput = ( 1/(Number(storedInput)) ).toString();
        printOutput();
        setAllClear();
    });


    // modified by Respondus - Trac #2516
    //$("#square-root-button").click(function(){
    $("#square-root-button").on( clickOrTouch, function(){
        storedInput = ( Math.pow(Number(storedInput), (1/2) ) ).toString();
        printOutput();
    });


    // modified by Respondus - Trac #2516
    //$("#third-root-button").click(function(){
    $("#third-root-button").on( clickOrTouch, function(){
        storedInput = ( Math.pow(Number(storedInput), (1/3) ) ).toString();
        printOutput();
    });



    // modified by Respondus - Trac #2516
    //$("#custom-root-button").click(function(){
    $("#custom-root-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }               
        prepareForOperations("customroot");
    });


    // modified by Respondus - Trac #2516
    //$("#log-base-e-button").click(function(){
    $("#log-base-e-button").on( clickOrTouch, function(){
        if(secondSettingMode) { // log x base y
            if(requestPlaced === true ){
                engageOperationEngine();
                printOutput();
            }               
            prepareForOperations("custom-logarithm");
        } else {
            storedInput = ( Math.log( Number(storedInput) ) ).toString();
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#log-base-10-button").click(function(){
    $("#log-base-10-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            storedInput = ( Math.log( Number(storedInput) )/ Math.log(2) ).toString();
            printOutput();            
        } else {
            storedInput = ( Math.log10( Number(storedInput) ) ).toString();
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#factorial-button").click(function(){
    $("#factorial-button").on( clickOrTouch, function(){
        storedInput = ( factorial(Number(storedInput)) ).toString();
        printOutput();
    });


    // modified by Respondus - Trac #2516
    //$("#sin-button").click(function(){
    $("#sin-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            if(radianMode){
                storedInput = (Math.asin(storedInput)).toString();            
            } else {
                storedInput = (Math.asin(storedInput) *180/ Math.PI ).toString();            
            }
            printOutput();            
        } else {
            if(radianMode){
                storedInput = (Math.sin(storedInput)).toString();            
            } else {
                storedInput = (Math.sin(storedInput * Math.PI/180) ).toString();            
            }
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#cos-button").click(function(){
    $("#cos-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            if(radianMode){
                storedInput = ( Math.acos(storedInput) ).toString();            
            } else {
                storedInput = (Math.acos(storedInput) * 180 / Math.PI ).toString();            
            }
            printOutput();            
        } else {
            if(radianMode){
                storedInput = ( Math.cos(storedInput) ).toString();            
            } else {
                storedInput = (Math.cos(storedInput * Math.PI/180)).toString();            
            }
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#tan-button").click(function(){
    $("#tan-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            if(radianMode){
                storedInput = (Math.atan(storedInput)).toString();            
            } else {
                storedInput = (Math.atan(storedInput) * 180/ Math.PI ).toString();
            }
            printOutput();            
        } else {
            if(radianMode){
                storedInput = (Math.tan(storedInput)).toString();            
            } else {
                storedInput = (Math.tan(storedInput * Math.PI/180)).toString();
            }
            printOutput();            
        }
    });

    // modified by Respondus - Trac #2516
    //$("#e-constant-button").click(function(){
    $("#e-constant-button").on( clickOrTouch, function(){
        storedInput = (Math.E).toString();
        printOutput();
    });

    // modified by Respondus - Trac #2516
    //$("#ee-button").click(function(){
    $("#ee-button").on( clickOrTouch, function(){
        if(requestPlaced === true ){
            engageOperationEngine();
            printOutput();
        }               
        prepareForOperations("EE");
    });
    
    // modified by Respondus - Trac #2516
    //$("#rad-button").click(function(){
    $("#rad-button").on( clickOrTouch, function(){
        if(radianMode){
            radianMode = false;
            $("#rad-display").text("");
            $("#rad-button").text("Rad");
        } else {
            radianMode = true;
            $("#rad-display").text("Rad");
            $("#rad-button").text("Deg");
        }
    });

    // modified by Respondus - Trac #2516
    //$("#sinh-button").click(function(){
    $("#sinh-button").on( clickOrTouch, function(){
        if (secondSettingMode) {
            storedInput = (Math.asinh(storedInput)).toString();
            printOutput();            
        } else {
            storedInput = (Math.sinh(storedInput)).toString();
            printOutput();            
        }

    });

    // modified by Respondus - Trac #2516
    //$("#cosh-button").click(function(){
    $("#cosh-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            storedInput = (Math.acosh(storedInput)).toString();
            printOutput();            
        } else {
            storedInput = (Math.cosh(storedInput)).toString();
            printOutput();            
        }
    });

    // modified by Respondus - Trac #2516
    //$("#tanh-button").click(function(){
    $("#tanh-button").on( clickOrTouch, function(){
        if(secondSettingMode) {
            storedInput = (Math.atanh(storedInput)).toString();
            printOutput();            
        } else {
            storedInput = (Math.tanh(storedInput)).toString();
            printOutput();            
        }
    });

    // modified by Respondus - Trac #2516
    //$("#pi-button").click(function(){
    $("#pi-button").on( clickOrTouch, function(){
        storedInput = (Math.PI).toString();
        setAllClear();
        printOutput();
    });


    // modified by Respondus - Trac #2516
    //$("#random-button").click(function(){
    $("#random-button").on( clickOrTouch, function(){
        storedInput = (Math.random()).toString();
        setAllClear();
        printOutput();
    });


    
});