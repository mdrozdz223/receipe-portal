import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
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
                            {user.role === 'ROLE_ADMIN' && (
                                <Link to="/admin" className="nav-link" style={{backgroundColor: '#fff', color: '#ff6b6b'}}>⚙️ Panel Admina</Link>
                            )}
                            <button className="logout-btn" onClick={() => setUser(null)}>Wyloguj ({user.username})</button>
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
                    <Route path="/recipe/:id" element={<RecipeDetails />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

function Home() {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    useEffect(() => { fetchRecipes(searchTerm, currentPage); }, [currentPage]);

    const fetchRecipes = (query = '', page = 0) => {
        fetch(`http://localhost:8081/api/recipes?search=${encodeURIComponent(query)}&page=${page}&size=6`)
            .then(res => res.json())
            .then(data => { setRecipes(data.content); setTotalPages(data.totalPages); })
            .catch(err => console.error(err));
    };

    return (
        <div>
            <div className="search-container">
                <input type="text" className="search-input" placeholder="Wyszukaj po nazwie lub składniku..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); fetchRecipes(e.target.value, 0); }} />
            </div>

            {recipes.length === 0 ? <p style={{textAlign: 'center'}}>Nie znaleziono przepisów.</p> : (
                <>
                    <div className="recipe-grid">
                        {recipes.map(r => (
                            <div key={r.id} className="recipe-card clickable-card" onClick={() => navigate(`/recipe/${r.id}`)}>
                                {/* Rysowanie zdjęcia na liście, jeśli przepis je posiada */}
                                {r.image && <img src={r.image} alt="Zdjęcie przepisu" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0', marginBottom: '1rem' }} />}
                                <h2>{r.title}</h2>
                                <p className="recipe-desc truncate">{r.description}</p>
                                <div className="recipe-section"><h4>Składniki</h4><p className="truncate">{r.ingredients}</p></div>
                                <div className="recipe-section"><h4>Instrukcje</h4><p className="truncate">{r.instructions}</p></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} style={{ padding: '0.8rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', background: currentPage === 0 ? '#ddd' : '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px' }}>Poprzednia</button>
                        <span style={{ fontWeight: 'bold', alignSelf: 'center' }}>Strona {currentPage + 1} z {totalPages === 0 ? 1 : totalPages}</span>
                        <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} style={{ padding: '0.8rem', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', background: currentPage >= totalPages - 1 ? '#ddd' : '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px' }}>Następna</button>
                    </div>
                </>
            )}
        </div>
    );
}

function RecipeDetails() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:8081/api/recipes/${id}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => setRecipe(data)).catch(() => alert("Nie znaleziono przepisu"));
    }, [id]);

    if (!recipe) return <p style={{textAlign: 'center', marginTop: '3rem'}}>Pobieranie...</p>;

    return (
        <div className="form-container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>← Wróć</button>

            {}
            {recipe.image && <img src={recipe.image} alt="Zdjęcie przepisu" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />}

            <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{recipe.title}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', fontStyle: 'italic', marginBottom: '2rem' }}>{recipe.description}</p>

            <div style={{ padding: '1rem 0', marginBottom: '1rem' }}>
                <h3 style={{ color: '#ff6b6b', marginBottom: '1rem', borderBottom: '2px solid #ff6b6b', display: 'inline-block' }}>Składniki:</h3>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.8' }}>{recipe.ingredients}</p>
            </div>

            <div style={{ padding: '1rem 0' }}>
                <h3 style={{ color: '#ff6b6b', marginBottom: '1rem', borderBottom: '2px solid #ff6b6b', display: 'inline-block' }}>Instrukcje:</h3>
                <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.8' }}>{recipe.instructions}</p>
            </div>
        </div>
    );
}

function Auth({ user, setUser }) {
    const [isReg, setIsReg] = useState(false);
    const [authData, setAuthData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

    const handleChange = (e) => setAuthData({ ...authData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isReg) {
            fetch('http://localhost:8081/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authData) })
                .then(res => { if (res.ok) { alert("Utworzono!"); setIsReg(false); } else alert("Błąd!"); });
        } else {
            const headers = { 'Authorization': 'Basic ' + btoa(authData.username + ':' + authData.password) };
            fetch('http://localhost:8081/api/recipes?page=0&size=1', { headers }).then(res => {
                if (res.ok) { setUser({ ...authData, role: authData.username === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER' }); navigate('/'); }
                else alert("Błędne dane");
            });
        }
    };

    return (
        <div className="form-container">
            <h2>{isReg ? "Rejestracja" : "Logowanie"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" name="username" placeholder="Login" onChange={handleChange} required /></div>
                <div className="form-group"><input type="password" name="password" placeholder="Hasło" onChange={handleChange} required /></div>
                <button type="submit" className="submit-btn">{isReg ? "Zarejestruj" : "Zaloguj"}</button>
            </form>
            <p className="toggle-text" onClick={() => setIsReg(!isReg)}>{isReg ? "Zaloguj się" : "Utwórz konto"}</p>
        </div>
    );
}

function AddRecipe({ user }) {
    const [recipe, setRecipe] = useState({ title: '', description: '', ingredients: '', instructions: '', image: '' });
    const navigate = useNavigate();

    useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRecipe({ ...recipe, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const headers = { 'Authorization': 'Basic ' + btoa(user.username + ':' + user.password), 'Content-Type': 'application/json' };
        fetch('http://localhost:8081/api/recipes', { method: 'POST', headers, body: JSON.stringify(recipe) })
            .then(res => { if (res.ok) { alert("Dodano!"); navigate('/'); } else alert("Błąd walidacji!"); });
    };

    if (!user) return null;

    return (
        <div className="form-container" style={{ maxWidth: '800px' }}>
            <h2>Dodaj przepis</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><input type="text" placeholder="Tytuł" value={recipe.title} onChange={(e) => setRecipe({...recipe, title: e.target.value})} required /></div>
                <div className="form-group"><input type="text" placeholder="Opis" value={recipe.description} onChange={(e) => setRecipe({...recipe, description: e.target.value})} required /></div>

                {}
                <div className="form-group" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden-file-input"
                    />
                    <label htmlFor="file-upload" className="custom-file-upload">
                        📷 {recipe.image ? "Zmień zdjęcie" : "Dodaj zdjęcie potrawy"}
                    </label>
                    {recipe.image && (
                        <div style={{ marginTop: '1rem' }}>
                            <img src={recipe.image} alt="Podgląd" style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                        </div>
                    )}
                </div>

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

    useEffect(() => { if (!user || user.role !== 'ROLE_ADMIN') { navigate('/'); } else { fetchUsers(); } }, [user, navigate]);

    const fetchUsers = () => { fetch('http://localhost:8081/api/users', { headers: getAuthHeaders() }).then(res => res.json()).then(data => setUsersList(data)); };
    const handleDelete = (id) => { if(window.confirm("Usunąć?")) { fetch(`http://localhost:8081/api/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(res => { if(res.ok) fetchUsers(); }); } };

    if (!user || user.role !== 'ROLE_ADMIN') return null;

    return (
        <div className="form-container" style={{ maxWidth: '800px' }}>
            <h2>Zarządzanie Użytkownikami</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead><tr style={{ borderBottom: '2px solid #ddd' }}><th style={{ padding: '10px' }}>ID</th><th>Login</th><th>Rola</th><th>Akcja</th></tr></thead>
                <tbody>{usersList.map(u => (<tr key={u.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{u.id}</td><td><strong>{u.username}</strong></td><td>{u.role}</td><td>{u.username !== user.username && (<button onClick={() => handleDelete(u.id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Usuń</button>)}</td></tr>))}</tbody>
            </table>
        </div>
    );
}

export default App;