import { Button } from 'react-bootstrap';
import ExerciseData from '../interfaces/exerciseData';
import { Exercise } from './exercise';
import { useEffect, useState } from 'react';
import { get, getDatabase, ref, remove } from 'firebase/database';

export function ExerciseManagementPage({
    allExData,
    setAllExData,
    fetch
}:{
    allExData: (ExerciseData | undefined)[];
    setAllExData: ((newData: (ExerciseData | undefined)[]) => void);
    fetch: (val: boolean) => void;
}) {
    useEffect(() => {
        if(exList.length === 0) {
            if(tags.length === 0 && diff === "All" && voices === 0 && types === "None") setExList(allExData.sort(exSortFunc));
        }
        if(exList.length > allExData.length) setExList(allExData.sort(exSortFunc));
    });

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

    const [mode, setMode] = useState<boolean>(false);
    const [newExercise, setNewExercise] = useState<ExerciseData |  undefined>(undefined);
    const [diff, setDiff] = useState<string>("All");
    const [types, setTypes] = useState<string>("None");
    const [voices, setVoices] = useState<number>(0);
    const [tags, setTags] = useState<string[]>([]);
    const [exList, setExList] = useState<(ExerciseData | undefined)[]>([]);

    const modeChange = function () {
        setMode(!mode);
        setDiff("All");
        setTypes("None");
        setVoices(0);
        setTags([]);
        sortExercises(undefined);
    }

    const createExercise = function () {
        var last = allExData[allExData.sort(indexSort).length-1];
        var newEx: ExerciseData;
        if(last !== undefined) newEx = new ExerciseData("", undefined, [], "", (last.exIndex) + 1, true,"Exercise " + (allExData.length+1),1,1,[],"None")
        else newEx = new ExerciseData("", undefined, [], "", 0, true,"Exercise " + (allExData.length+1),1,1,[],"None")
        setAllExData([...allExData, newEx]);
        setExList([...allExData, newEx]);
        setNewExercise(newEx);
    }

    const sortExercises = function (input: string | string[] | number | undefined) {
        var tempTags = tags, tempDiff = diff, tempVoices = voices, tempTypes = types;
        if (typeof(input) === "object") tempTags = input;
        else if (typeof(input) === "string"){
            if( input === "None" || input === "Drone" || input === "Ensemble Parts" || input === "Both")
                tempTypes = input;
            else tempDiff = input; 
        } 
        else if (typeof(input) === "number") tempVoices = input;
        var list: (ExerciseData | undefined)[] = [];
        var method = "all";
        if (tempTags.length === 0 && tempDiff === "All" && tempVoices === 0 && tempTypes === "None") method = "";
        else if (tempDiff === "All" && tempVoices === 0 && tempTypes === "None") method = "tags";
        else if (tempTags.length === 0 && tempVoices === 0 && tempTypes === "None") method = "diff";
        else if (tempTags.length === 0 && tempDiff === "All" && tempTypes === "None") method = "voices";
        else if (tempVoices === 0 && tempTypes === "None") method = "diffTags";
        else if (tempTags.length === 0 && tempTypes === "None") method = "diffVoices";
        else if (tempDiff === "All" && tempTypes === "None") method = "tagsVoices";
        else if (tempDiff === "All" && tempVoices === 0 && tempTags.length === 0) method = "types";
        else if (tempDiff === "All" && tempVoices === 0) method = "tagsTypes";
        else if (tempTags.length === 0 && tempVoices === 0) method = "diffTypes";
        else if (tempTags.length === 0 && tempDiff === "All") method = "voicesTypes";
        else if (tempVoices === 0) method = "diffTagsTypes";
        else if (tempTags.length === 0 ) method = "diffVoicesTypes";
        else if (tempDiff === "All") method = "tagsVoicesTypes";
        else if (tempTypes === "None") method = "diffTagsVoices";
        
        //console.log(method);
        switch (method) {
            case "diff": // only diff selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempDiff === String(exercise.difficulty) 
                    else return false;})
                        .sort(exSortFunc);
                    
                setExList(list);
                break;
            case "tags": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return tempTags.every((element) => exercise.tags.includes(element))
                    }
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voices": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTags": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempDiff === String(exercise.difficulty))}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoices": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices)
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoices": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsVoices": // all sorting options selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "types":
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined){
                        return (tempTypes === exercise.types)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTypes": // only diff selected
            list = allExData.filter(function(exercise) {
                if (exercise !== undefined) 
                    return (tempDiff === String(exercise.difficulty) && tempTypes === exercise.types)
                else return false;})
                    .sort(exSortFunc);
            setExList(list);
            break;
            case "tagsTypes": // only tags selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element)) && tempTypes === exercise.types)}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "voicesTypes": // only voices selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return tempVoices === exercise.voices && tempTypes === exercise.types
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "diffTagsTypes": // diff and tags selected (no voices)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempTypes === exercise.types}
                    else return false;})
                        .sort(exSortFunc)
                setExList(list);
                break;
            case "diffVoicesTypes": // diff and voices selected (no tags)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined) 
                        return (tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices) && tempTypes === exercise.types
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "tagsVoicesTypes": // tags and voices selected (no diff)
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempVoices === exercise.voices && tempTypes === exercise.types}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            case "all": // all sorting options selected
                list = allExData.filter(function(exercise) {
                    if (exercise !== undefined && tempTags !== undefined && exercise.tags !== undefined){
                        return (tempTags.every((element) => exercise.tags.includes(element))) && tempDiff === String(exercise.difficulty) && tempVoices === exercise.voices && tempTypes === exercise.types}
                    else return false;})
                        .sort(exSortFunc);
                setExList(list);
                break;
            default:
                list = allExData.sort(exSortFunc)
                setExList(list);
                break;
        }
    }

    const exSortFunc = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            try {
                if(e1.title.startsWith("Exercise ")) return 1;
                else if(e2.title.startsWith("Exercise ")) return -1;
                var e1Sorted = e1.tags.sort().length;
                var e2Sorted = e2.tags.sort().length;
                if (e1Sorted > e2Sorted) return 1;
                else if (e1Sorted < e2Sorted) return -1;
                else {
                    if (e1.title > e2.title) return 1;
                    else if (e1.title < e2.title) return -1;
                    else {
                        if(e1.difficulty > e2.difficulty) return 1;
                        else if(e1.difficulty < e2.difficulty) return -1;
                        else return 0;
                    }
                }
            } catch {
                if(e1.title > e2.title) return 1;
                else if(e1.title < e2.title) return -1;
                else return 0;
            };
        } else return 0;
    }

    const indexSort = function (e1: ExerciseData | undefined, e2: ExerciseData | undefined): number {
        if (e1 !== undefined && e2 !== undefined) {
            if(e1.exIndex > e2.exIndex) return 1;
            else if(e1.exIndex < e2.exIndex) return -1;
            else return 0;
        } else return 0;
    }

    //onClick function for diff change
    const diffChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setDiff((e.target.value));
        sortExercises(e.target.value);
    }

    //onClick function for tags change
    const tagsChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if(tags.includes(val)) {
            tags.splice(tags.indexOf(val), 1);
            setTags([...tags]);
            sortExercises([...tags]);
        } else {
            setTags([...tags, val]);
            sortExercises([...tags, val]);
        } 
    }

    //onClick function for voices change
    const voiceChange = function (e: React.ChangeEvent<HTMLSelectElement>) {
        setVoices(Number(e.target.value));
        sortExercises(Number(e.target.value));
    }

    const typesChange = function (e: React.ChangeEvent<HTMLSelectElement>){
        setTypes(e.target.value);
        sortExercises(e.target.value);
        
    }

    //onClick to reset all exercise sort fields
    const resetSort = function () {
        setTags([]);
        setDiff("All");
        var diffBox = document.getElementsByName("difficulty")[0] as HTMLSelectElement;
        if (diffBox !== null) diffBox.options[0].selected = true;
        setVoices(0);
        var voiceBox = document.getElementsByName("voices")[0] as HTMLSelectElement;
        if (voiceBox !== null) voiceBox.options[0].selected = true;
        setTypes("None");
        var typesBox = document.getElementsByName("types")[0] as HTMLSelectElement;
        if(typesBox !== null) typesBox.options[0].selected = true;
    }

    // function to handle selection of exercises - for deletion 
    const handleSelectExercise = (exIndex: number) => {
        const index = selectedIndexes.indexOf(exIndex);
        if (index === -1) {
            // exercise not selected - add it to the selected list
            setSelectedIndexes([...selectedIndexes, exIndex]);
        } else {
            // exercise is selected - remove from the selected list
            const updatedSelection = [...selectedIndexes];
            updatedSelection.splice(index, 1);
            setSelectedIndexes(updatedSelection);
        }
    };

    // function to handle deletion of selected exercises
    const handleMultipleExerciseDelete = async (selectedIndexes: number[]) => {
        try {
            const database = getDatabase();
    
            // delete exercises from the database
            await Promise.all(selectedIndexes.map(async (exIndex) => {
                const exerciseRef = ref(database, `scores/${exIndex}`);
                const snapshot = await get(exerciseRef);
                if (snapshot.exists()) {
                    await remove(exerciseRef);
                } else {
                    console.log('exercise' + exIndex + ' not found in the database');
                }
            }));
    
            // remove exercises from the page
            const updatedExercises = allExData.filter((exercise) => {
                return !selectedIndexes.includes(exercise?.exIndex || -1);
            });
            setAllExData(updatedExercises);
            alert("selected exercises deleted!");
            // reload the page without changing the url 
            window.location.href = window.location.href;
        } catch (error) {
            console.error('error deleting exercises:', error);
            alert('error deleting exercises.');
        }
    };

    return (
        <div style={{margin: "10px"}}>
            <h2 style={{display:"inline"}}>Welcome to the Exercise Management Page!</h2>
            <form id="editMode" style={{display: "inline", float:"right"}}>
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="switchCheckDefault" checked={mode} onChange={modeChange}/>
                </div>
            </form>
            <h5 style={{marginTop: "8px", fontStyle: "italic"}}>Use the slider on the right to toggle between adding and editing exercises.</h5>
            {!mode ? 
                <div>
                    <span style={{marginLeft: "4px"}}>Sort By:
                    <form id= "tags">
                        <div style={{fontSize:"16px", display:"inline"}}>Tags:</div>
                        <br></br>
                        <input type="checkbox" name="tags" value="Pitch" checked={tags.includes("Pitch")} onChange={tagsChange}style={{margin: "4px"}}/>Pitch
                        <input type="checkbox" name="tags" value="Intonation" checked={tags.includes("Intonation")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Intonation
                        {/* <input type="checkbox" name="tags" value="Drone" checked={tags.includes("Drone")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Drone
                        <input type="checkbox" name="tags" value="Ensemble" checked={tags.includes("Ensemble")} onChange={tagsChange} style={{marginLeft: "12px"}}/> Ensemble */}
                        {/* <input type="checkbox" name="tags" value="Rhythm" checked={tags.includes("Rhythm")} onChange={tagsChange}/>Rhythm */}
                    </form>
                    <div id="dropdowns" style={{display: "inline-flex", padding: "4px"}}>
                        <form id="difficulty">
                            <div style={{fontSize:"16px", display:"inline"}}>Difficulty:</div>
                            <br></br>
                            <select name="difficulty" onChange={diffChange}>
                                <option value="All">All</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                {/* <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option> */}
                            </select>
                        </form>
                        <form id="voiceCt">
                            Voices:
                            <br></br>
                            <select name="voices" onChange={voiceChange}>
                                <option value={0}>Any</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                {/* <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option> */}
                            </select>
                        </form>
                        <form id="typesForm">
                            Textural Factors:
                            <br></br>
                            <select name="types" onChange={typesChange}>
                                <option value="None">None</option>
                                <option value="Drone">Drone</option>
                                <option value="Ensemble Parts">Ensemble Parts</option>
                                <option value="Both">Drone & Ensemble Parts</option>
                            </select>
                        </form>
                        <Button variant="danger" onClick={resetSort} style={{marginLeft: "10px"}}>Reset Sort</Button>
                        {!mode && (
                                <Button
                                variant="danger" 
                                onClick={() => handleMultipleExerciseDelete(selectedIndexes)} 
                                style={{ marginTop: "10px" }}
                                >Delete Selected Exercises
                                </Button>
                            )}
                    </div>
                </span>
                {exList.map((exercise) => {
                        if (exercise !== undefined)
                            return (
                                <Exercise
                                    key={exercise.exIndex}
                                    teacherMode={true}
                                    ExData={exercise}
                                    allExData={allExData}
                                    setAllExData={setAllExData}
                                    exIndex={exercise.exIndex}
                                    setNewExercise={undefined}
                                    handleSelectExercise={handleSelectExercise}
                                    isSelected={selectedIndexes.includes(exercise.exIndex)}
                                    fetch={undefined}
                                />
                            )
                        else return (<div key={Math.random()} />);
                    })}
                {exList.length === 0 ? <div>No exercises found! Maybe try adding one?</div> : <></>}

                </div> 
                : <div>
                   <Button style={{ color: "white", borderColor: "blue", display: "flex" }} onClick={createExercise}>+ New Exercise</Button>
                    {newExercise !== undefined ? <div>
                        <Exercise
                            key={newExercise.exIndex}
                            teacherMode={true}
                            ExData={newExercise}
                            allExData={allExData}
                            setAllExData={setAllExData}
                            exIndex={newExercise.exIndex}
                            setNewExercise={setNewExercise}
                            handleSelectExercise={undefined}
                            isSelected={undefined}
                            fetch={fetch}
                        />

                    </div> : <></>}
                </div>}
            
            
            <br></br>
            {/* <Button onClick={fetch} variant="success">Sync with Database</Button> */}
        </div>
    );
}
