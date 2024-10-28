import React, { useState, useEffect } from 'react';
import './App.css';
import Preview from './components/preview';
import Messege from './components/messege';
import NotesContainer from './components/Notes/NotesContainer';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/note';
import NoteForm from './components/Notes/Noteform';
import Alert from './components/Alert';


function App() {

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('notes')){
      setNotes(JSON.parse(localStorage.getItem('notes')))
    }else{
      localStorage.setItem('notes', JSON.stringify([]))
    }
  }, []);

  useEffect(() => {
    if (validationErrors.length !== 0){
      setTimeout(() => {
        setValidationErrors([])
      }, 3000)
    }
  }, [validationErrors])

  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  };

  const validate = () => {
    const validationErrors = [];
    let passed = true;
    if (!title){
      validationErrors.push("الرجاء إدخال عنوان للملاحظة");
      passed = false;
    }

    if (!content){
      validationErrors.push("الرجاء إدخال محتوى للملاحظة");
      passed = false  
    }

    setValidationErrors(validationErrors);
    return passed;
  }

  // change note title
  const changeTitleHandler = (event) => {
    setTitle(event.target.value);
  }

  // change note content
  const changeContentHandler = (event) => {
    setContent(event.target.value)
  }

  // save note
  const saveNoteHandler = () => {
    
    if (!validate()) return;

    const note = {
      id: new Date(),
      title: title,
      content: content
    };

    const updateNotes = [...notes, note];

    saveToLocalStorage('notes', updateNotes)
    setNotes(updateNotes);
    setCreating(false);
    setSelectedNote(note.id);
    setTitle('');
    setContent('');
  }

  // select note
  const selectNoteHandler = noteId => {
    setSelectedNote(noteId);
    setCreating(false);
    setEditing(false)
  }

  // switch to editing mode
  const editNoteHandler = () => {
    const note = notes.find(note => note.id === selectedNote);
    setEditing(true);
    setTitle(note.title);
    setContent(note.content)
  }

  // update note
  const updateNoteHandler = () => {

    if (!validate()) return;

    const updatedNotes = [...notes];
    const noteIndex = notes.findIndex(note => note.id === selectedNote);
    updatedNotes[noteIndex] = {
      id: selectedNote,
      title: title,
      content: content
    };

    setNotes(updatedNotes);
    setEditing(false);
    setTitle('');
    setContent('')
  }

  // switch to preview mode
  const addNoteHandler = () => {
    setCreating(true);
    setEditing(false);
    setTitle('');
    setContent('');
  }

  // delete note
  const deleteNoteHandler = () => {
    const updatedNotes = [...notes];
    const noteIndex = updatedNotes.findIndex(note => note.id === selectedNote);
    notes.splice(noteIndex, 1);
    saveToLocalStorage('notes', notes)
    setNotes(notes);
    setSelectedNote(null)
  }



  const getAddNote = () => {
    return (
      <NoteForm
        formTitle="ملاحظة جديدة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="حفظ"
        submitClicked={saveNoteHandler}
      />
    );
  };

  const getPreview = () => {
    if (notes.length === 0) {
      return <Messege title='There is no notes' />
    };

    if (!selectedNote) {
      return <Messege title='Please select a note' />
    }

    const note = notes.find(note => {
      return note.id === selectedNote;
    })

    let noteDisplay = (
      <div>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </div>
    );

    if (editing) {
      noteDisplay = (
        <NoteForm
          formTitle="تعديل ملاحظة"
          title={title}
          content={content}
          titleChanged={changeTitleHandler}
          contentChanged={changeContentHandler}
          submitText="تعديل"
          submitClicked={updateNoteHandler}
       />
      );
    }

    return (
      <div>
        {!editing &&
          <div className="note-operations">
            <a href="#" onClick={editNoteHandler}>
              <i className="fa fa-pencil-alt" />
            </a>
            <a href="#" onClick={deleteNoteHandler}>
              <i className="fa fa-trash" />
            </a>
          </div>
        }
        {noteDisplay}
      </div>
    );
  };

  return (
    <div className="App">
      <NotesContainer>
        <NotesList>
          {notes.map(note =>
            <Note
              key={note.id}
              title={note.title}
              noteClicked={() => selectNoteHandler(note.id)}
              active={selectedNote === note.id}
            />
          )}
        </NotesList>
        <button className="add-btn" onClick={addNoteHandler}>+</button>
      </NotesContainer>
      <Preview>
        {creating ? getAddNote() : getPreview()}
      </Preview>
      {validationErrors.length !== 0 && <Alert validationMessages={validationErrors} />}
    </div>
  );
}

export default App;
