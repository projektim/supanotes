import { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type Note = {
  id: string;
  content: string;
};

let connection: Promise<string> | undefined;

function connect() {
  if (!connection) {
    connection = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) {
        return data.session.user.id;
      }
      const result = await supabase.auth.signInAnonymously();
      if (result.error) throw result.error;
      if (!result.data.user) {
        throw new Error('Povezivanje nije uspjelo.');
      }
      return result.data.user.id;
    })().catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function loadNotes() {
      try {
        const id = await connect();
        const { data, error } = await supabase
          .from('notes')
          .select('id, content')
          .eq('user_id', id);
        if (error) throw error;
        if (active) {
          setUserId(id);
          setNotes(data ?? []);
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Učitavanje bilješki nije uspjelo.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadNotes();
    return () => {
      active = false;
    };
  }, []);

  async function saveNote() {
    const text = content.trim();
    if (!text || !userId || saving) return;
    setSaving(true);
    setMessage('');
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: text,
          user_id: userId,
        })
        .select('id, content')
        .single();
      if (error) throw error;
      setNotes((previous) => [data, ...previous]);
      setContent('');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Spremanje bilješke nije uspjelo.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Moje bilješke</Text>
      {loading ? (
        <Text>Učitavanje bilješki...</Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Napiši bilješku..."
            placeholderTextColor="#777"
            value={content}
            onChangeText={setContent}
            multiline
            editable={!!userId && !saving}
          />
          <Button
            title={saving ? 'Spremanje...' : 'Spremi bilješku'}
            onPress={saveNote}
            disabled={!userId || !content.trim() || saving}
          />
          <Text style={styles.subheading}>Spremljene bilješke</Text>
          {userId && notes.length === 0 && (
            <Text>Nema bilješki. Napiši prvu bilješku iznad.</Text>
          )}
          {notes.map((note) => (
            <View key={note.id} style={styles.note}>
              <Text style={styles.noteText}>{note.content}</Text>
            </View>
          ))}
        </>
      )}
      {!!message && (
        <Text style={styles.error}>{message}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 50,
    gap: 16,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#111',
  },
  note: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  noteText: {
    fontSize: 16,
    color: '#111',
  },
  error: {
    color: '#b91c1c',
  },
});