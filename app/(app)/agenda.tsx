import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, CheckCircle, Plus } from 'lucide-react-native';
import { useState } from 'react';

type Task = {
  id: number;
  title: string;
  detail: string;
  completed: boolean;
};

export default function Agenda() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Riego Programado', detail: 'Sector A1 - 10 de Abril, 7:00 AM', completed: false },
    { id: 2, title: 'Revisión de plagas', detail: 'Sector B2 - 11 de Abril, 9:00 AM', completed: false },
    { id: 3, title: 'Cosecha estimada', detail: 'Sector C3 - 15 de Abril, 6:00 AM', completed: false },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [showForm, setShowForm] = useState(false);

  const toggleComplete = (id: number) => {
    setTasks(prev =>
      prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
    );
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTitle,
      detail: newDetail,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setNewDetail('');
    setShowForm(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Agenda' }} />
      <View style={styles.header}>
        <Calendar size={32} color="#50c878" />
        <Text style={styles.title}>Agenda de Cultivo</Text>
        <Text style={styles.subtitle}>Tareas programadas y próximas acciones</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
        <Plus size={20} color="#ffffff" />
        <Text style={styles.addButtonText}>Agregar Tarea</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título de la tarea"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Detalle (opcional)"
            value={newDetail}
            onChangeText={setNewDetail}
          />
          <TouchableOpacity style={styles.saveButton} onPress={addTask}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      {tasks.map(task => (
        <View
          key={task.id}
          style={[styles.taskCard, task.completed && styles.completedCard]}
        >
          <View style={styles.taskContent}>
            <View>
              <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
                {task.title}
              </Text>
              {task.detail !== '' && (
                <Text style={[styles.taskDetail, task.completed && styles.completedText]}>
                  {task.detail}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => toggleComplete(task.id)}>
              <CheckCircle size={28} color={task.completed ? '#50c878' : '#ccc'} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#66bb6a',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b1260',
    marginBottom: 6,
  },
  taskDetail: {
    fontSize: 14,
    color: '#555',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  completedCard: {
    backgroundColor: '#e8f5e9',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50c878',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    marginBottom: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4fbcff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


