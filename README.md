# Tour Booking Platform - Full-Stack Developer Test

Welcome to our technical assessment! This is a simplified tour booking platform that tests your full-stack development skills with React/TypeScript frontend and Node.js/Express backend.

## Test Overview

**Time Limit**: 2-3 hours maximum

**What You'll Be Doing**:
- Fix 3 realistic bugs in the existing codebase
- Implement a tour search/filter feature
- Demonstrate clean code practices

**Tech Stack**:
- Frontend: React 18, TypeScript, React Router
- Backend: Node.js, Express.js
- Database: JSON Server (easy setup) or Firebase (optional)

## Quick Start

Choose your preferred setup option:

```bash
# 1. Clone and setup backend
git clone <repository-url>
cd tour-booking-platform/backend
cp .env.example .env
# Edit .env with your Firebase credentials if you choose to work with Firebase
npm install
npm run seed  # Creates sample data
npm run dev:json  # Starts backend + JSON Server

# 2. Setup frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env  # Uses default settings
# Edit .env with your Firebase credentials if you choose to work with Firebase
npm start
```

## Verification

Once setup is complete, you should see:
- ✅ Frontend running at http://localhost:3000
- ✅ Backend API responding at http://localhost:3001/api/tours
- ✅ Tour cards displaying on the main page

## Test Tasks

### Task 1: Debugging

Fix these 3 bugs in priority order:

1. **Mobile Responsive Design**
   - **Issue**: Tour cards don't display properly on mobile devices
   - **Where to look**: `frontend/src/App.css`
   - **What's wrong**: Mobile styles for tour cards are incomplete

2. **API Error Handling**
   - **Issue**: GET /api/tours endpoint has poor error handling (try: `/api/tours?minPrice=abc`)
   - **Where to look**: `backend/src/controllers/tourController.js`
   - **What's wrong**: Error handling needs improvement

3. **State Management Bug**
   - **Issue**: TourList component re-renders unnecessarily
   - **Where to look**: `frontend/src/components/TourList.tsx`
   - **What's wrong**: useEffect dependencies need optimization

### Task 2: Feature Development

**Implement Tour Search/Filter System**

**Frontend Requirements**:
- Add search input field for tour name
- Add filter dropdowns for location and price range
- Update TourList component to handle filtered results
- Add loading states and empty states

**Backend Requirements**:
- Add search endpoint: `GET /api/tours/search?name=X&location=Y&minPrice=Z&maxPrice=W`
- Implement efficient filtering logic
- Add proper error handling and validation

**Acceptance Criteria**:
- ✅ Users can search tours by name (partial match)
- ✅ Users can filter by location (exact match)
- ✅ Users can filter by price range
- ✅ Results update in real-time
- ✅ No results state is handled gracefully

### Task 3: Code Quality

- Use meaningful commit messages
- Add brief comments for complex logic
- Ensure TypeScript types are properly defined
- Test your implementation manually

## Time Management Tips

### Recommended Approach (2-3 hours total)
1. **Setup**: Get the app running
2. **Debugging**: Fix bugs in priority order
3. **Feature Development**: Implement search/filter
4. **Final Review**: Test and commit

### If You're Running Short on Time
**Priority Order**:
1. Fix mobile responsive design bug
2. Implement frontend search functionality
3. Fix API error handling
4. Implement backend search API
5. Fix state management bug

## Sample Data

The application includes sample tours from major cities:
- Paris City Tour (€299, 3 days)
- Tokyo Adventure (€599, 7 days)
- New York Explorer (€399, 4 days)
- London Heritage Walk (€199, 2 days)
- Rome Ancient Wonders (€449, 5 days)
- Sydney Harbor Experience (€349, 3 days)

## Submission

1. Fork this repository
2. Create a branch: `git checkout -b feature/your-name`
3. Make your changes and commit with meaningful messages
4. Submit a pull request with:
   - Working code (even if incomplete)
   - Brief explanation of your approach
   - Any assumptions or design decisions

## Troubleshooting

**Port already in use**:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Node modules issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase connection issues**:
- Verify Firebase project settings
- Check environment variables
- Ensure Firestore and Auth are enabled

## Important Notes

- **Quality over quantity**: A well-implemented partial solution is better than a rushed complete one
- **Ask questions**: If anything is unclear, don't hesitate to ask
- **Show your process**: We're interested in how you approach problems, not just the final result
- **Have fun**: This is a chance to show your skills and learn something new!

Good luck! 🚀