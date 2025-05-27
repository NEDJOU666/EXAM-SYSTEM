import React from 'react';

const UserManagement = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Management</h2>

      {/* Section: Add/Edit User */}
      <div style={styles.section}>
        <h3>Add or Edit User</h3>
        {/* Form inputs for name, email, role, status (active/inactive) */}
        {/* Add "Save" button */}
      </div>

      {/* Section: User List */}
      <div style={styles.section}>
        <h3>All Users</h3>
        {/* Display table/list of users with actions: Edit | Delete | Deactivate */}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
};

export default UserManagement;

