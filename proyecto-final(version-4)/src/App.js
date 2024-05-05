import React, { useState, useEffect } from 'react';
import './App.css'; 
import logo from './Logo2.JPG'; 

// Establecer conexión con la bd
import {} from "./firebase";
import { getDocs, addDoc, collection, where, query } from "firebase/firestore"; // Para hacer las consultas a la bd
import { db } from "./firebase";

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false); 
  const [usernamex, setUsernamex] = useState('');
  const [passwordx, setPasswordx] = useState('');
  const [Sign_up, setSign_up] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [chartColor, setChartColor] = useState('blue');
  const [chartSize, setChartSize] = useState(0);
  const [ingresosPercentage, setIngresosPercentage] = useState(0);
  const [gastosPercentage, setGastosPercentage] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [logoutClicked, setLogoutClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState('main'); // Nuevo estado para controlar la página a mostrar
  const [editTransactionIndex, setEditTransactionIndex] = useState(null);
  const [totalSaldo, setTotalSaldo] = useState(0);

  useEffect(() => {
    const ingresos = history.reduce((acc, item) => acc + (Number(item.amount) > 0 ? Number(item.amount) : 0), 0);
    const gastos = history.reduce((acc, item) => acc + (Number(item.amount) < 0 ? Number(item.amount) : 0), 0);

    setTotalIngresos(ingresos.toFixed(2));
    setTotalGastos(gastos.toFixed(2));

    const saldo = ingresos - Math.abs(gastos);
    setTotalSaldo(saldo.toFixed(2));
  }, [history]);

  useEffect(() => {
    document.body.classList.toggle('logged-in', loggedIn);
  }, [loggedIn]);

  // Aquí comienza Login
  const handleLogin = async () => {
    const dbref = collection(db, "Auth");

    try {
      const matchUser = query(dbref, where("User", "==", username));
      const matchPassword = query(dbref, where("Password", "==", password));

      const userSnapshot = await getDocs(matchUser)
      const userArray = userSnapshot.docs.map((doc) => doc.data());

      const passwordSnapshot = await getDocs(matchPassword)
      const passwordArray = passwordSnapshot.docs.map((doc) => doc.data());

      if (userArray.length > 0 && passwordArray.length > 0) {
        setLoggedIn(true);
        setShowErrorMessage(false);  // Oculta el mensaje de error si las credenciales son correctas
      } else {
        setShowForm(true);
        setShowErrorMessage(true); // Muestra el mensaje de error

        setTimeout(() => {
          setShowErrorMessage(false);
        }, 3000);
      }

    } catch (error) {

    }
  };

  const handleSingup = async () => {
    const dbref= collection(db,"Auth");
    const matchUser = query (dbref, where ("User", "==", usernamex ));

    try{
      const snapshot = await getDocs(matchUser);
      const userMatchingArray = snapshot.docs.map((doc) => doc.data())

      if (userMatchingArray.length > 0 ){
        alert("Usuario no válido")

      } else{
        await addDoc(dbref,{ User: usernamex, Password: passwordx})
        setLoggedIn(true);
        setShowErrorMessage(false);
        setSign_up(true);
      }

    }catch (error){
      
    }
  };



  // Aqui termina lo del login

  const handleAddTransaction = async () => {
    if (!description || !selectedOption || !amount) { // Validar que todos los campos estén llenos
      setShowErrorMessage(true);

      setTimeout(() => {
        setShowErrorMessage(false);
      }, 1500);

      return;
    }

    // Validar que el monto sea un número válido
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 1500);
      return;
    }

    // Agregar la transacción
    const newEntry = {
      description: description,
      amount: parsedAmount,
      category: selectedOption
    };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    setDescription('');
    setAmount('');
    setSelectedOption('');

    // Enviar la transacción a Firestore
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      description: newEntry.description,
      amount: newEntry.amount,
      category: newEntry.category
    });
    console.log("Documento agregado con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al agregar el documento: ", e);
  }

    updateChart(updatedHistory);
  };

  const handleDeleteTransaction = (index) => {
    console.log(index);
    const updatedHistory = [...history];
    console.log(updatedHistory);
    updatedHistory.splice(index, 1); // Eliminar la transacción en el índice proporcionado
    setHistory(updatedHistory);

    updateChart(updatedHistory);
  };

  const handleEditTransaction = (index, updatedTransaction, cancel = false) => {
    if (!cancel) {
      const updatedHistory = [...history];
      updatedHistory[index] = updatedTransaction;
      setHistory(updatedHistory);

      updateChart(updatedHistory);
    }
    setEditTransactionIndex(null); // Asegurarse de restablecer el estado de edición después de editar
  };

  useEffect(() => {
    if (logoutClicked) {
      setLoggedIn(false);
      setLoggedInUser("");
      setSign_up(true);
      setHistory([]);
      setTaskList([]);
      setLogoutClicked(false);
      setCurrentPage('main');
    }
  }, [logoutClicked]);

  const handleCategoryClick = (category) => {
    setCurrentPage(category); // Cambia la página al hacer clic en un cuadro gris
  };

  const filteredHistory = history.filter((transaction) => transaction.category === currentPage);

  const updateChart = (updatedHistory) => {
    const totalAmount = updatedHistory.reduce((acc, item) => acc + Number(item.amount), 0);
  
    const ingresos = updatedHistory.reduce((acc, item) => acc + (item.amount > 0 ? item.amount : 0), 0);
    const gastos = updatedHistory.reduce((acc, item) => acc + (item.amount < 0 ? item.amount : 0), 0);
  
    const ingresosPercentage = (ingresos / totalAmount) * 100;
    const gastosPercentage = (Math.abs(gastos) / totalAmount) * 100;
  
    setChartSize(totalAmount);
    setIngresosPercentage(ingresosPercentage);
    setGastosPercentage(gastosPercentage);
  };
  

  return (
    <div>
      {!loggedIn && (
        <div>
          <div className="header">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="red-bar"></div>
        </div>
      )}
      {loggedIn && currentPage === 'main' && ( // Mostrar la página principal mientras currentPage sea 'main'
        <div>
          <div className="red-box">
            <p>Mis finanzas/Gastos</p>
            <button className="logout-button" onClick={() => setLogoutClicked(true)}>x</button>
          </div>
          <h1>Bienvenido {loggedInUser}</h1>
          {showErrorMessage && <p style={{ color: 'white' }}>Favor llenar todos los campos</p>}
          <div className="total-container">
          <div className="total-item">
            <p>Total de ingresos:</p>
            <p className="income">{totalIngresos}</p>
          </div>
          <div className="total-item">
            <p>Total de gastos:</p>
            <p className="expense">{totalGastos}</p>
          </div>
          <div className="total-item">
            <p>Saldo total:</p>
            <p className="balance">{totalSaldo}</p>
          </div>
        </div>
          <div className="form-container">
            <input
              type="text"
              placeholder="Ingrese descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Ingrese monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
            />
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="form-input"
            >
              <option value="">Seleccione una opción</option>
              <option value="Efectivo/Transferencias">Efectivo/Transferencias</option>
              <option value="Transporte">Transporte</option>
              <option value="Alimentación">Alimentación</option>
            </select>
            <button className="gray-button" onClick={handleAddTransaction}>Agregar transacción</button>
          </div>

          <div className="circle-container">
            {chartSize > 0 && (
              <div className="circle" style={{ background: `conic-gradient(green 0% ${ingresosPercentage}%, red ${ingresosPercentage}% ${ingresosPercentage + gastosPercentage}%, transparent ${ingresosPercentage + gastosPercentage}% 100%)` }}></div>
            )}
          </div>

          <div className="categories-container">
            <div className="category-box" onClick={() => handleCategoryClick('Efectivo/Transferencias')}>Efectivo/Transferencias</div>
            <div className="category-box" onClick={() => handleCategoryClick('Transporte')}>Transporte</div>
            <div className="category-box" onClick={() => handleCategoryClick('Alimentación')}>Alimentación</div>
          </div>
        </div>
      )}
      {loggedIn && currentPage !== 'main' && ( // Mostrar la página correspondiente al hacer clic en un cuadro gris
        <div className="gray-page">
          <div className="red-box">
            <p>Mis finanzas/Gastos</p>
            <button className="logout-button" onClick={() => setLogoutClicked(true)}>x</button>
          </div>
          <div className="gray-box">
            <div className="back-arrow" onClick={() => setCurrentPage('main')}>
              ←
            </div>
            <h3> {currentPage}</h3>
          </div>

          <div className="transactions-container">
            <h3>Historial de transacciones:</h3>
            <ul>
              {filteredHistory.map((transaction, index) => (
                <div key={index} className="transaction-box">
                  <div className="transaction-content">
                    <div>
                      <span>{transaction.description}</span>
                      <span>{transaction.amount}</span>
                    </div>
                    <div>
                      {editTransactionIndex === index ? (
                        <div>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <button onClick={() => handleEditTransaction(index, { ...transaction, description, amount })}>Guardar</button>
                          <button onClick={() => handleEditTransaction(index, transaction, true)}>Cancelar</button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => { setEditTransactionIndex(index); setDescription(transaction.description); setAmount(transaction.amount); }}>Editar</button>
                          <button onClick={() => handleDeleteTransaction(index)}>Eliminar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>
      )}
      {!loggedIn && (
        <div className="login-container">
          <div className="login-box">
            {showErrorMessage && <p style={{ color: 'black' }}>Usuario y/o contraseña incorrectos</p>}
            <label>
              Usuario:
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              Contraseña:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <div className="button-container">
              <button type="button" onClick={handleLogin}>
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}
      {!loggedIn && (
        <div className="create-account-container">
          <button type="button" onClick={() => setSign_up(false)} className="create-account-button">
            Crear cuenta
          </button>
        </div>
      )}


{!Sign_up && (
        <div className="login-container">
          <div className="login-box">
            {showErrorMessage && <p style={{ color: 'black' }}>Usuario y Contraseña no Válidos</p>}
            <label>
              Coloque un Usuario Nuevo:
              <input
                type="text"
                value={usernamex}
                onChange={(e) => setUsernamex(e.target.value)}
              />
            </label>
            <label>
              Coloque una Contraseña:
              <input
                type="password"
                value={passwordx}
                onChange={(e) => setPasswordx(e.target.value)}
              />
            </label>
            <div className="button-container">
              <button type="button" onClick={handleSingup}>
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
