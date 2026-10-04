# Civic Connect

Civic Connect is a civic complaint tracking system that allows citizens
to register municipal complaints and track their complaints using a
unique Issue ID.

## Features

- Register civic complaints
- Generate unique Issue ID
- Track complaints
- View complaint status
- Admin dashboard
- Update complaint status
- Complaint status history
- Responsive user interface

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- Pydantic

### Database
- MongoDB

## Complaint Status

SUBMITTED → UNDER REVIEW → IN PROGRESS → RESOLVED

REJECTED is used for invalid or duplicate complaints.

## Project Structure

civic-connect/
├── backend/
├── frontend/
├── README.md
└── .gitignore

## How It Works

1. Citizen submits a complaint.
2. System generates a unique Issue ID.
3. Complaint is stored in MongoDB.
4. Citizen tracks the complaint using the Issue ID.
5. Admin reviews the complaint.
6. Admin updates the complaint status.
7. The citizen can see the latest status and history.

## Future Enhancements

- Citizen authentication
- Email/SMS notifications
- Location/map integration
- Mobile application
- <img width="1600" height="1200" alt="WhatsApp Image 2026-10-04 at 8 24 47 AM (1)" src="https://github.com/user-attachments/assets/74bb6902-2022-47fc-8363-6a2108bab19b" />
<img width="1600" height="1458" alt="WhatsApp Image 2026-10-04 at 8 55 35 AM" src="https://github.com/user-attachments/assets/ab203b0a-5c59-43af-b15a-afccdbbfb81b" />
<img width="1600" height="1346" alt="WhatsApp Image 2026-10-04 at 8 55 35 AM (1)" src="https://github.com/user-attachments/assets/d9310974-ae43-4bfa-b74d-0696aff6fa96" />

