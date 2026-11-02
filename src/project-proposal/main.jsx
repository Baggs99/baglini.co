import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './project-proposal.css'
import ProjectProposalPage from './ProjectProposalPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProjectProposalPage />
  </StrictMode>,
)
