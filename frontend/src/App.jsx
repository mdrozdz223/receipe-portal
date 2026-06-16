import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    const getAuthHeaders = () => {
        if (!user) return {};
        return {
            'Authorization': 'Basic ' + btoa(user.username + ':' + user.password),
            'Content-Type': 'application/json'
        };
    };

    return (
        <BrowserRouter>
            <nav className="navbar">
                <div className="navbar-brand">🍽️ SmacznyPortal</div>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Przeglądaj Przepisy</Link>
                    {user ? (
                        <>
                            <Link to="/add" className="nav-link">Dodaj Przepis</Link>

                            {}
                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="nav-link" style={{backgroundColor: '#fff', color: '#ff6b6b'}}>⚙️ Panel Admina</Link>
                            )}

                            <button className="logout-btn" onClick={() => setUser(null)}>
                                Wyloguj ({user.username})
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">Logowanie</Link>
                    )}
                </div>
            </nav>

            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Auth user={user} setUser={setUser} />} />
                    <Route path="/add" element={<AddRecipe user={user} />} />
                    <Route path="/admin" element={<AdminPanel user={user} getAuthHeaders={getAuthHeaders} />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

function Home() {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchRecipes(); }, []);

    const fetchRecipes = (query = '') => {
        const url = query ? `http://localhost:8081/api/recipes?search=${encodeURIComponent(query)}` : 'http://localhost:8081/api/recipes';
        fetch(url).then(res => res.json()).then(data => setRecipes(data)).catch(err => console.error(err));
    };

    return (
        <div>
            <div className="search-container">
                <input type="text" className="search-input" placeholder="Wyszukaj po nazwie lub składniku..."
                       value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); fetchRecipes(e.target.value); }} />
            </div>

            {recipes.length === 0 ? <p style={{textAlign: 'center'}}>Nie znaleziono przepisów.</p> : (
                <div className="recipe-grid">
                    {recipes.map(r => (
                        <div key={r.id} className="recipe-card">
                            <h2>{r.title}</h2>
                            <p className="recipe-desc">{r.description}</p>
                            <div className="recipe-section"><h4>Składniki</h4><p>{r.ingredients}</p></div>
                            <div className="recipe-section"><h4>Instrukcje</h4><p>{r.instructions}</p></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Auth({ user, setUser }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [authData, setAuthData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

    const handleChange = (e) => setAuthData({ ...authData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegistering) {
            fetch('http://localhost:8081/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authData)
            }).then(res => {
                if (res.ok) { alert("Utworzono konto!"); setIsRegistering(false); }
                else { alert("Login zajęty."); }
            });
        } else {
            const headers = { 'Authorization': 'Basic ' + btoa(authData.username + ':' + authData.password) };
            fetch('http://localhost:8081/api/recipes', { headers })
                .then(res => {
                    if (res.ok) {
                        const role = authData.username === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER';
                        setUser({ ...authData, role: role });
                        navigate('/');
                    }
                    else { alert("Błędny login lub hasło."); }
                });
        }
    };

    return (
        <div className="form-container">
            <h2>{isRegistering ? "Zarejestruj się" : "Zaloguj się"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" name="username" placeholder="Login" onChange={handleChange} required /></div>
                <div className="form-group"><input type="password" name="password" placeholder="Hasło" onChange={handleChange} required /></div>
                <button type="submit" className="submit-btn">{isRegistering ? "Zarejestruj" : "Zaloguj"}</button>
            </form>
            <p className="toggle-text" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Masz już konto? Zaloguj się" : "Utwórz konto"}
            </p>
        </div>
    );
}

function AddRecipe({ user }) {
    const [recipe, setRecipe] = useState({ title: '', description: '', ingredients: '', instructions: '' });
    const navigate = useNavigate();

    useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const headers = { 'Authorization': 'Basic ' + btoa(user.username + ':' + user.password), 'Content-Type': 'application/json' };
        fetch('http://localhost:8081/api/recipes', { method: 'POST', headers, body: JSON.stringify(recipe) })
            .then(res => { if (res.ok) { alert("Dodano!"); navigate('/'); } else { alert("Błąd."); } });
    };

    if (!user) return null;

    return (
        <div className="form-container" style={{ maxWidth: '800px' }}>
            <h2>Dodaj przepis</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" placeholder="Tytuł" value={recipe.title} onChange={(e) => setRecipe({...recipe, title: e.target.value})} required /></div>
                <div className="form-group"><input type="text" placeholder="Opis" value={recipe.description} onChange={(e) => setRecipe({...recipe, description: e.target.value})} required /></div>
                <div className="form-group"><textarea placeholder="Składniki" value={recipe.ingredients} onChange={(e) => setRecipe({...recipe, ingredients: e.target.value})} required /></div>
                <div className="form-group"><textarea placeholder="Instrukcje" value={recipe.instructions} onChange={(e) => setRecipe({...recipe, instructions: e.target.value})} required /></div>
                <button type="submit" className="submit-btn">Zapisz przepis</button>
            </form>
        </div>
    );
}

function AdminPanel({ user, getAuthHeaders }) {
    const [usersList, setUsersList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'ROLE_ADMIN') {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [user, navigate]);

    const fetchUsers = () => {
        fetch('http://localhost:8081/api/users', { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setUsersList(data))
            .catch(err => alert("Brak dostępu lub błąd serwera."));
    };

    const handleDelete = (id) => {
        if(window.confirm("Na pewno usunąć tego użytkownika?")) {
            fetch(`http://localhost:8081/api/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
                .then(res => {
                    if(res.ok) {
                        alert("Usunięto!");
                        fetchUsers();
                    } else {
                        alert("Nie udało się usunąć.");
                    }
                });
        }
    };

    if (!user || user.role !== 'ROLE_ADMIN') return null;

    return (
        <div className="form-container" style={{ maxWidth: '800px' }}>
            <h2>Zarządzanie Użytkownikami</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th>Login</th>
                    <th>Rola</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{u.id}</td>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.role}</td>
                        <td>
                            {u.username !== user.username && (
                                <button
                                    onClick={() => handleDelete(u.id)}
                                    style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                    Usuń
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;