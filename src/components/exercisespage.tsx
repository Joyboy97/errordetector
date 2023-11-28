import React, { useState } from 'react';
import  abcjs from 'abcjs';

export function ExercisesPage({ 
    correctAnswers, 
    setCorrectAnswers
}: { 
    correctAnswers: Array<String> | undefined;
    setCorrectAnswers: (newCorrect: Array<String>) => void;
}) {
    const [output, setOutput] = useState<String>();
    const [selectedAnswers, setSelectedAnswers] = useState<Array<String>>([]);
    const [itemList, setItemList] = useState<JSX.Element[]>();

    const clickListener = function (abclem:object, tuneNumber: number,classes:string, analysis:abcjs.ClickListenerAnalysis, drag:abcjs.ClickListenerDrag){
    
        var op = "abcelem: [Object]<br>tuneNumber: " + tuneNumber + "<br>classes: " + classes + "<br>analysis: " + JSON.stringify(analysis) + "<br>drag: " + JSON.stringify(drag);
        setOutput(op);
        var test = document.querySelector(".clicked-info");
        if(test !== null) {test.innerHTML = "<div class='label'>Clicked info:</div>" + op;}}
    
    const loadScore = function() {
        var abcString = "X:1\nZ:Copyright ©\n%%scale 0.83\n%%pagewidth 21.59cm\n%%leftmargin 1.49cm\n%%rightmargin 1.49cm\n%%score [ 1 2 ] 3\nL:1/4\nQ:1/4=60\nM:4/4\nI:linebreak $\nK:Amin\nV:1 treble nm=Flute snm=Fl.\nV:2 treble transpose=-9 nm=Alto Saxophone snm=Alto Sax.\nV:3 bass nm=Violoncello snm= Vc.\nV:1\nc2 G3/2 _B/ | _A/_B/ c _d f | _e _d c2 |] %3\nV:2\n[K:F#min] =c d c3/2 e/ | =f f/e/ d2 | =f e f2 |] %3\nV:3\n_A,,2 _E,,2 | F,,2 _D,,2 | _E,,2 _A,,2 |] %3";
        var el = document.getElementById("target");
        if(el != null){abcjs.renderAbc(el,abcString,{ clickListener: clickListener});}
    }

    const selectAnswer = function() {
        if(output !== undefined && !selectedAnswers?.includes(output)) {
            const newSelected = ([...selectedAnswers, output]);
            const newList = newSelected.map((selItem: String) => <li key={selItem.slice(-3).slice(0, 2)}>{selItem}</li>);
            setItemList(newList);
            console.log(itemList);
            setSelectedAnswers(newSelected);
        }
    }

    return (
        <div>
            <h2>Welcome to the Exercises Page!</h2>

            <span>
                <button onClick={loadScore}>Load Score</button>
                <div id ="target"></div>
                <div className="clicked-info"></div>
                <button onClick={selectAnswer}>Select Answer</button>
                <div>Currently selected answers:</div>
                <ul>{itemList}</ul>
                
            </span>
        </div>

    );
}
