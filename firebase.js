import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const Stack = createNativeStackNavigator();

function BotaoFlutuante({ navigation }) {
  return (
    <View style={s.floatingContainer}>
      <TouchableOpacity
        style={s.floatingButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={s.floatingText}>← Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <View style={s.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#004d00" />
      <View style={s.box}>
        <Text style={s.logo}>INSTITUTO VIDALLES</Text>
        <Text style={s.sub}>Bem-vindo(a)!</Text>

        <TextInput
          style={s.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={s.input}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={s.mainButton}
          onPress={() => navigation.navigate("Paciente")}
        >
          <Text style={s.mainButtonText}>ENTRAR</Text>
        </TouchableOpacity>

        <View style={s.smallButtonsRow}>
          <TouchableOpacity
            style={s.smallButton}
            onPress={() => navigation.navigate("Terapeuta")}
          >
            <Text style={s.smallButtonText}>ACESSO EQUIPE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.smallButton}
            onPress={() => navigation.navigate("Admin")}
          >
            <Text style={s.smallButtonText}>ACESSO DESENVOLVEDOR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Paciente({ navigation }) {
  const [consultas, setConsultas] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "consultas"), (snap) => {
      setConsultas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <View style={s.listBg}>
      <Text style={s.pageTitle}>AGENDA</Text>
      <FlatList
        data={consultas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.item}
            onPress={() => navigation.navigate("Video", { sala: item.id })}
          >
            <Text style={s.itemText}>
              {item.data} - {item.hora}
            </Text>
            <Text style={s.subItem}>Terapeuta: {item.terapeuta}</Text>
          </TouchableOpacity>
        )}
      />
      <BotaoFlutuante navigation={navigation} />
    </View>
  );
}

function Terapeuta({ navigation }) {
  const [consultas, setConsultas] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "consultas"), (snap) => {
      setConsultas(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <View style={s.listBg}>
      <Text style={s.pageTitle}>AGENDA</Text>
      <FlatList
        data={consultas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.item}
            onPress={() => navigation.navigate("Video", { sala: item.id })}
          >
            <Text style={s.itemText}>
              {item.data} - {item.hora}
            </Text>
            <Text style={s.subItem}>Paciente: {item.paciente}</Text>
          </TouchableOpacity>
        )}
      />
      <BotaoFlutuante navigation={navigation} />
    </View>
  );
}

function Admin({ navigation }) {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [paciente, setPaciente] = useState("");
  const [terapeuta, setTerapeuta] = useState("");
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "consultas"), (snap) => {
      setAgenda(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const adicionarConsulta = async () => {
    if (!data || !hora || !paciente || !terapeuta) {
      alert("Preencha todos os campos!");
      return;
    }
    await addDoc(collection(db, "consultas"), {
      data,
      hora,
      paciente,
      terapeuta,
    });
    setData("");
    setHora("");
    setPaciente("");
    setTerapeuta("");
  };

  const excluirConsulta = async (id) => {
    await deleteDoc(doc(db, "consultas", id));
  };

  return (
    <View style={s.listBg}>
      <Text style={s.pageTitle}>AGENDA</Text>
      <View style={s.form}>
        <TextInput
          style={s.input}
          placeholder="Data (YYYY-MM-DD)"
          value={data}
          onChangeText={setData}
        />
        <TextInput
          style={s.input}
          placeholder="Hora (HH:MM)"
          value={hora}
          onChangeText={setHora}
        />
        <TextInput
          style={s.input}
          placeholder="Paciente"
          value={paciente}
          onChangeText={setPaciente}
        />
        <TextInput
          style={s.input}
          placeholder="Terapeuta"
          value={terapeuta}
          onChangeText={setTerapeuta}
        />
        <TouchableOpacity style={s.button} onPress={adicionarConsulta}>
          <Text style={s.buttonText}>AGENDAR CONSULTA</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={agenda}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View>
                <Text style={s.itemText}>
                  {item.data} - {item.hora}
                </Text>
                <Text style={s.subItem}>
                  {item.paciente} com {item.terapeuta}
                </Text>
              </View>
              <TouchableOpacity onPress={() => excluirConsulta(item.id)}>
                <Text style={{ color: "red", fontWeight: "bold" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <BotaoFlutuante navigation={navigation} />
    </View>
  );
}

function Video({ route, navigation }) {
  const { sala } = route.params;
  const url = `https://meet.jit.si/${sala}`;
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
      <BotaoFlutuante navigation={navigation} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Paciente" component={Paciente} />
        <Stack.Screen name="Terapeuta" component={Terapeuta} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="Video" component={Video} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#006400",
    justifyContent: "center",
    alignItems: "center",
  },
  listBg: { flex: 1, backgroundColor: "#f9f9f9", paddingTop: 50 },
  box: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  logo: { fontSize: 18, color: "#004d00", letterSpacing: 3, marginBottom: 10 },
  sub: { fontSize: 24, color: "#003300", marginBottom: 20, fontStyle: "italic" },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003300",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  mainButton: {
    backgroundColor: "#006400",
    paddingVertical: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  mainButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  smallButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  smallButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: 11,
    color: "#003300",
    fontStyle: "italic",
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#006400",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  item: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  itemText: { fontSize: 16, color: "#003300", fontWeight: "600" },
  subItem: { color: "#555", marginTop: 5 },
  form: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  floatingContainer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 30,
  },
  floatingText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
