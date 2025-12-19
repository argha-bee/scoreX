im developing a cricket match score tracking website.

the normal user can see in the dahsboard the live match scores and the upcoming matches just like the espn cricinfo website

the scorer will have to signup or login (use nextauth, send email for verification with token, signup and login with google) and then he can schedule a match, with team names, time and venue and with total overs, total wickets.

then when the scorer will start the toss, he will require to input the team members and select one captain and one wk from each sides. then the toss is done and the winner of the toss and the choice of the winner will be given as input by the scorer. the bowling and batting teams will be automatically assigned.

then the scorer will start the match. he will need to choose the bowler and the batters on the striking and non-striking end. then he will update scores ball by ball. you have to handle the logics for extra runs. for no balls and wide balls, you wont count it as a valid ball. the over will end automatically and the website will ask the scorer to get a new bowler if all the overs are not bowled or all wicket is not done. also he will choose the batter after a wicket goes down. and other things will automatically handled by the webstie.

like the scoreboard, the individual scores, the crr, rrr, target, runs needed, balls left etc. the individual scores will get updating.

the scorer can also input special events like match stopped due to rain, shortage of light, or others: <input>, or special events like drinks break, something break, innings break, and all.

the scorer can end the match anytime or the match will automatically over if it gets a result by logic. if the match tied, it will ask if a superover will happen. and when the match will over, it will generate a match summary, top performers by runs and wickets from both teams as we get in TVs after a match.

the scoreboard part is really important.

now implement this with NEXT JS. not typescript, only Javascript. use module.css files for styles. use, use next js 15 app router. use mongoose and define schemas in details. use nodemailer and mailtrap for sending emails for verification. also keep option for google login and signup

also handle the database and backend very carefully.

now based on this, write me a prompt for chatgpt that is detailed and points out every possible aspects to make it generate the best code for me


<GEMINI>
"I am building a Cricket Match Score Tracking website similar to ESPNcricinfo using Next.js 15 (App Router) and JavaScript (no TypeScript). I need you to act as a Senior Full-Stack Developer.Tech Stack Requirements:Framework: Next.js 15 (App Router, JavaScript).Database: MongoDB with Mongoose.Authentication: NextAuth.js (v5 or latest) supporting Google Provider and Credentials Provider (Email/Password).Email: Nodemailer with Mailtrap for sending verification tokens.Styling: CSS Modules (.module.css).Project Scope & Logic:Database Schemas: Create detailed Mongoose models for:User: Name, email, password, image, isVerified, verificationToken.Match: Teams (Name, Player List), Venue, Date, Total Overs, Total Wickets.LiveScore: Score, Wickets, Overs (ball-by-ball tracking), Striker/Non-Striker IDs, Current Bowler ID, Extras (Wides/No-balls logic), Match Status (Upcoming, Live, Finished, Rain Delay, etc.).Scorer Workflow: * Pre-Match: Input teams, select Captain and Wicketkeeper. Handle Toss logic (Winner + Choice) to assign Batting/Bowling sides.Match Engine: * Choose opening batters and bowler.Ball-by-ball updates: Handle 'Extra' runs (Wide/No-ball do not increment the ball count in the over).Over transitions: Automatically prompt for a new bowler after 6 valid balls.Wicket logic: Prompt for a new batter when a wicket falls.Calculations: Real-time CRR (Current Run Rate), RRR (Required Run Rate), Target, Balls Left.Special Events: UI for manual inputs like "Rain Delay," "Drinks Break," or "Innings Break."End Game: Handle "Match Over" logic (Target reached or all out). If tied, include a toggle for "Super Over."Post-Match: Generate a Match Summary component with top performers (top 3 batters/bowlers).Deliverables:Folder Structure: Organize by /models, /lib/mongodb.js, /app/api/, and /components.Authentication Logic: Provide the auth.js configuration and the verification email API route.The Scoreboard Component: Create a robust React component that manages the live state and sends updates to MongoDB.CSS: Provide basic module.css examples for a clean, professional dashboard.Please start by defining the Mongoose Schemas and the NextAuth configuration first, then move to the scoring logic."Important Architectural AdviceWhen you receive the code, pay close attention to how the striker/non-striker swap is handled.Why this is tricky:The Swap: If a batter scores 1, 3, or 5 runs, the striker and non-striker must swap.Over End: At the end of an over, the players stay at their ends, but the "Striker" role effectively swaps because the bowling happens from the other side.The "Extras" Logic: * Wide: +1 run to total, 0 balls added to over count.No Ball: +1 run to total + any runs scored off the bat, 0 balls added to over count.Suggested Database Structure for Match LogicEnsure your AI provides a schema that looks similar to this to keep the data "normalized":FeatureData TypePurposeinningsArrayStores data for 1st and 2nd innings separately.ballByBallArray of ObjectsRecords every event (runs, wicket, extra) for the wagon wheel/summary.lineupArray of ObjectsTracks individual runsConceded, wickets, ballsFaced, runsScored.


<ChatGPT>
