import { Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './state/SettingsContext';
import TabBar from './components/TabBar';
import Dashboard from './routes/Dashboard';
import AddSession from './routes/AddSession';
import History from './routes/History';
import Charts from './routes/Charts';
import Settings from './routes/Settings';

export default function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <main className="app__main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<AddSession />} />
            <Route path="/log/:id" element={<AddSession />} />
            <Route path="/history" element={<History />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </SettingsProvider>
  );
}
