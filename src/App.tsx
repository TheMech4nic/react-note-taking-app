import "bootstrap/dist/css/bootstrap.min.css"
import { Container } from "react-bootstrap";
import { Navigate, Route, Routes } from "react-router-dom";
import { NewNote } from "./NewNote";
import { useLocalStorage } from "./useLocalStorage";
import { useMemo } from "react";
import {v4 as uuidV4} from "uuid";
import NodeList from "./NodeList";
import NoteLayout from "./NoteLayout";
import Note from "./Note";
import { EditNote } from "./EditNote";

export type Note = {
  id : string
} & NoteData

export type RawNote = {
  id : string,
} & RawNoteData

export type RawNoteData = {
  title : string, 
  markdown : string,
  tagsIds : string[]  
}

export type NoteData = {
  title : string,
  markdown : string,
  tags: Tag[]
}

export type Tag = {
  id : string,
  label : string
}


function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", [])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", [])

  const  notesWithTags = useMemo(() => {
    return notes.map(note => {
      return {...note, tags: tags.filter(tag => note.tagsIds.includes(tag.id))}
    })
  }, [notes, tags]);


  function onCreateNote({tags, ...data} : NoteData){
    setNotes(prevNotes => {
      return [...prevNotes, {...data, id: uuidV4(), tagsIds : tags.map(tag => tag.id)}]
    })
  }

  function onUpdateNote(id: string, {tags, ...data} : NoteData){
    setNotes(prevNotes => {
      return (prevNotes.map(note => {
        if(note.id == id){
          return {...note, ...data, tagsIds : tags.map(tag => tag.id)}
        }else{
          return note;
        }
      }))
      return [...prevNotes, {...data, id: uuidV4(), tagsIds : tags.map(tag => tag.id)}]
    })
  }

  function addTag(tag: Tag){
    setTags(prev => [...prev, tag])
  }

  function onDeleteNote(id:string){
    setNotes(prevNotes => {
      return prevNotes.filter(note => note.id !== id);
    })
  }

  function updateTag(id: string, label: string){
    setTags(prevTags => {
      return prevTags.map(tag => {
        if(tag.id === id){
          return {...tag, label}
        }else{
          return tag
        }
      })
    })
  }

  function deleteTag(id: string){
    setTags(prevTags => {
      return prevTags.filter(tag => tag.id !== id);
    })
  }

  return (
    <Container className="my-4">
      <Routes>
        <Route path="/" element={<NodeList notes={notesWithTags}  availableTags={tags}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
        />}></Route>
        <Route path="/new" element={<NewNote onSubmit={onCreateNote} onAddTag={addTag} availableTags={tags} />}></Route>
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDeleteNote={onDeleteNote} />}></Route>
          <Route path="edit" element={<EditNote onSubmit={onUpdateNote} onAddTag={addTag} availableTags={tags} />}></Route>
        </Route>
        <Route path="*" element={<Navigate to='/' />}></Route>
      </Routes>
    </Container>
  )
};

export default App;