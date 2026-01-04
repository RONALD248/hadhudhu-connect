# Hadhudhu SDA Church Management System

A comprehensive church management system for the Hadhudhu Seventh-day Adventist Church. Built with React, TypeScript, and Lovable Cloud.

## 🌟 Features

### Member Management
- **Member Directory**: View and manage all church members with detailed profiles
- **Profile Information**: Track personal details, contact info, emergency contacts, baptism dates
- **Membership Status**: Track active/inactive members with membership numbers

### Financial Management
- **Contributions Tracking**: Record and manage tithes, offerings, and special contributions
- **Payment Categories**: Organize contributions by category (tithe, offering, building fund, etc.)
- **Pledges**: Track member pledges and fulfillment status
- **Payment Methods**: Support for cash, bank transfer, mobile money, and check payments
- **Financial Reports**: Generate reports for accounting and compliance

### Department Management
- **Department Structure**: Create and manage church departments (Youth, Women's Ministry, etc.)
- **Member Assignment**: Assign members to departments
- **Department Heads**: Designate department leaders

### Reporting & Analytics
- **Contribution Reports**: Detailed financial reports with filtering options
- **Activity Logs**: Complete audit trail of all system actions
- **Export Options**: Download reports as CSV or PDF for compliance

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access, user management, role assignment, activity logs |
| **Treasurer** | Manage contributions, payments, pledges, financial reports |
| **Secretary** | Manage member profiles, departments, attendance |
| **Pastor** | View members, contributions, pastoral care features |
| **Member** | View own profile and contribution history |

## 🚀 Getting Started

### For Church Administrators

1. **Access the Application**: Navigate to your deployed app URL
2. **Login**: Use your registered email and password
3. **First-time Setup** (Super Admin):
   - Add approved email patterns for staff roles
   - Create payment categories
   - Set up departments
   - Register staff members

### User Registration

1. Click "Register" on the login page
2. Fill in personal details (first name, last name, email, phone)
3. Create a secure password (minimum 6 characters)
4. Submit registration
5. Contact church admin to upgrade role if needed

### Dashboard Navigation

- **Dashboard**: Overview of church statistics and quick actions
- **Members**: View and manage member directory
- **Contributions**: Record and view financial contributions
- **Reports**: Generate financial and membership reports
- **Settings**: Manage personal profile and preferences
- **User Management** (Admin): Manage user roles and permissions
- **Activity Logs** (Super Admin): View system audit trail

## 📊 Key Workflows

### Recording a Contribution

1. Navigate to **Contributions** page
2. Click **"Record Payment"**
3. Select member, category, and payment method
4. Enter amount and date
5. Add optional description and reference number
6. Save the contribution

### Managing User Roles

1. Navigate to **User Management** (Super Admin only)
2. Find the user in the list
3. Click the role badge to edit
4. Select new role from dropdown
5. Confirm the change

### Exporting Reports

1. Navigate to **Reports** or **Activity Logs**
2. Apply any desired filters
3. Click **"Export CSV"** or **"Export PDF"**
4. File downloads automatically

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**: Granular permissions per user role
- **Row-Level Security (RLS)**: Database-level data protection
- **Activity Logging**: Complete audit trail of all actions
- **Approved Email Patterns**: Control who can receive sensitive roles
- **Secure Authentication**: Password-protected accounts with session management

## 🛠 Technical Details

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row-Level Security
- **Authentication**: Supabase Auth
- **State Management**: TanStack React Query

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Member personal information |
| `user_roles` | User role assignments |
| `payments` | Financial contribution records |
| `payment_categories` | Contribution category definitions |
| `pledges` | Member pledge commitments |
| `departments` | Church department structure |
| `member_departments` | Member-department associations |
| `activity_logs` | System audit trail |
| `approved_role_emails` | Approved email patterns for roles |
| `payment_settings` | System payment configuration |

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🆘 Support

For technical issues or feature requests:
1. Check the Activity Logs for error details
2. Contact your church administrator
3. Submit feedback through the application

## 📄 License

This project is built for Hadhudhu SDA Church.

---

Built with ❤️ using [Lovable](https://lovable.dev)
