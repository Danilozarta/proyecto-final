import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Alerta from '../components/Alerta';
import clienteAxios from '../config/axios';

import imgLogin from '../assets/svg/LOGO HORIZONTAL.png';
import fondoLogin from '../assets/neodevs.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alerta, setAlerta] = useState({});
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setAlerta({}); // Limpiar alertas previa
    
        if ([email, password].includes('')) {
            setAlerta({ msg: "Todos los campos son obligatorios", error: true });
            setCargando(false);
            return;
        }
    
        try {
            const result = await login(email, password); // Usa la función login del AuthProvider
        
            if (result.ok) {
                // Redirige según el rol usando el estado de auth
                if (result.rol === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/homeHs');
                }
            } else {
                setAlerta({
                    msg: result.msg || 'Error al iniciar sesión',
                    error: true
                });
                setCargando(false); // Restablece el etado cargando a falso
            }
        } catch (error) {
            setAlerta({
                msg: error.response?.data?.msg || 'Error al iniciar sesión',
                error: true
            });
            setCargando(false);
        }
    };

    const { msg } = alerta;

    return (
        
        
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="header-epp bg-white shadow-md py-4">
                <div className="container mx-auto flex justify-center">
                    <img 
                        src={imgLogin} 
                        alt="LOGO HORIZONTAL" 
                        className="logo-epp h-16" 
                    />
                </div>
            </header>

            {/* Main */}
            <main className="main-container-epp flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="h1-login-epp text-3xl font-extrabold text-black">
                            Iniciar sesión
                        </h1>
                    </div>
                    
                    {msg && <Alerta alerta={alerta} />}
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Usuario
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-login-epp appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-login-epp appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link 
                                    to="/olvide-password" 
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div> */}

                        <div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className={`w-full py-3 px-4 text-white bg-[#2a8e00] hover:bg-[#84b321] rounded-md font-medium text-base sm:text-sm transition-colors duration-200 ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
                            </button>
                        </div>
                    </form>

                    {/* <div className="text-center">
                        <Link 
                            to="/registro" 
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            ¿No tienes cuenta? Regístrate aquí
                        </Link>
                    </div> */}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer-epp bg-white py-4">
                <div className="container mx-auto text-center text-white text-sm">
                    <p>&copy; {new Date().getFullYear()} Unipalma. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Login;
