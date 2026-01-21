"use client";

import React from 'react';

export default function LoginPage() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        padding: 32,
        border: '1px solid #ddd',
        borderRadius: 12,
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: 320,
        width: '90%'
      }}>
        <h2 style={{ marginBottom: 24, color: '#333' }}>Login to Teamfloor</h2>
        <a href="/api/slack/login" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#4A154B',
          color: '#fff',
          borderRadius: 8,
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: 16,
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3e1250')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4A154B')}
        >
          Login with Slack
        </a>
      </div>
    </div>
  );
}
