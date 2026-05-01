import ProfileCard from './components/ProfileCard'
import './App.css'

function App() {
  return (
    <main className="app-container">
      <ProfileCard
        name="Javi A. Torres"
        title="Software Engineer"
        handle="javicodes"
        status="Online"
        contactText="Contact Me"
        avatarUrl="https://i.pravatar.cc/300"
        showUserInfo={true}
        enableTilt={true}
        enableMobileTilt
        onContactClick={() => console.log('Contact clicked')}
        behindGlowEnabled
        innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
      />
    </main>
  )
}

export default App
