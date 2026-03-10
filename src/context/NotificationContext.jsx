import React, { createContext, useContext, useState, useCallback } from 'react';
import { CloseSquare } from 'iconsax-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const notify = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto remove after 8 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 8000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="notification-container">
                {notifications.map((n) => (
                    <div key={n.id} className={`notification-popup ${n.type}`}>
                        <div className="notification-content">
                            {n.message}
                        </div>
                        <button 
                            className="notification-close" 
                            onClick={() => removeNotification(n.id)}
                            aria-label="Close notification"
                        >
                            <CloseSquare size="20" variant="Bold" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
