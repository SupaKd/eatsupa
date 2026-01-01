// src/hooks/useOrderNotifications.js
// Hook pour gérer les notifications sonores des nouvelles commandes

import { useState, useEffect, useCallback, useRef } from 'react';

// Configuration
const NOTIFICATION_SOUND_FREQUENCY = 800; // Hz
const NOTIFICATION_SOUND_DURATION = 200; // ms
const NOTIFICATION_REPEAT_COUNT = 3;
const NOTIFICATION_REPEAT_INTERVAL = 300; // ms
const AUTO_REPEAT_INTERVAL = 15000; // Répéter toutes les 15s si commandes en attente

/**
 * Hook pour gérer les notifications sonores des nouvelles commandes
 * @param {Array} commandes - Liste des commandes actuelles
 * @param {Object} options - Options de configuration
 * @returns {Object} - État et fonctions de contrôle
 */
export function useOrderNotifications(commandes = [], options = {}) {
  const {
    enabled: initialEnabled = true,
    autoRepeat = true,
    onNewOrder = null,
  } = options;

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('orderNotificationSound');
    return saved !== null ? JSON.parse(saved) : initialEnabled;
  });
  
  const [hasPermission, setHasPermission] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastNotifiedIds, setLastNotifiedIds] = useState(new Set());
  
  const audioContextRef = useRef(null);
  const repeatIntervalRef = useRef(null);
  const previousCommandesRef = useRef([]);

  // Initialiser l'AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        setHasPermission(true);
      } catch (error) {
        console.error('Erreur initialisation AudioContext:', error);
        setHasPermission(false);
      }
    }
    return audioContextRef.current;
  }, []);

  // Jouer un son de notification
  const playNotificationSound = useCallback(async (repeat = NOTIFICATION_REPEAT_COUNT) => {
    if (!soundEnabled) return;

    const audioContext = initAudioContext();
    if (!audioContext) return;

    // Reprendre l'AudioContext si suspendu
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const playBeep = (delay = 0) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = NOTIFICATION_SOUND_FREQUENCY;
      oscillator.type = 'sine';

      // Envelope pour un son plus agréable
      const startTime = audioContext.currentTime + delay / 1000;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + NOTIFICATION_SOUND_DURATION / 1000);

      oscillator.start(startTime);
      oscillator.stop(startTime + NOTIFICATION_SOUND_DURATION / 1000);
    };

    // Jouer plusieurs beeps
    for (let i = 0; i < repeat; i++) {
      playBeep(i * NOTIFICATION_REPEAT_INTERVAL);
    }
  }, [soundEnabled, initAudioContext]);

  // Jouer un son d'alerte plus urgent
  const playUrgentSound = useCallback(async () => {
    if (!soundEnabled) return;

    const audioContext = initAudioContext();
    if (!audioContext) return;

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Pattern d'alerte urgente
    const frequencies = [800, 1000, 800, 1000, 800];
    const durations = [150, 150, 150, 150, 300];

    let currentTime = audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + durations[index] / 1000);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + durations[index] / 1000);

      currentTime += durations[index] / 1000 + 0.05;
    });
  }, [soundEnabled, initAudioContext]);

  // Activer/désactiver le son
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('orderNotificationSound', JSON.stringify(newValue));
      
      // Initialiser l'AudioContext au premier clic (nécessaire pour les navigateurs)
      if (newValue) {
        initAudioContext();
      }
      
      return newValue;
    });
  }, [initAudioContext]);

  // Activer le son (utile pour le premier clic utilisateur)
  const enableSound = useCallback(() => {
    setSoundEnabled(true);
    localStorage.setItem('orderNotificationSound', JSON.stringify(true));
    initAudioContext();
  }, [initAudioContext]);

  // Marquer une commande comme notifiée
  const markAsNotified = useCallback((commandeId) => {
    setLastNotifiedIds(prev => new Set([...prev, commandeId]));
  }, []);

  // Effacer les notifications (quand l'utilisateur les a vues)
  const clearNotifications = useCallback(() => {
    const currentIds = commandes.map(c => c.id);
    setLastNotifiedIds(new Set(currentIds));
    
    // Arrêter la répétition automatique
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, [commandes]);

  // Tester le son
  const testSound = useCallback(() => {
    const wasEnabled = soundEnabled;
    if (!wasEnabled) {
      initAudioContext();
    }
    
    // Jouer un son même si désactivé (pour le test)
    const audioContext = audioContextRef.current || initAudioContext();
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 600;
      oscillator.type = 'sine';

      const startTime = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  }, [soundEnabled, initAudioContext]);

  // Détecter les nouvelles commandes
  useEffect(() => {
    const commandesEnAttente = commandes.filter(c => c.statut === 'en_attente');
    const currentIds = new Set(commandesEnAttente.map(c => c.id));
    
    // Trouver les nouvelles commandes
    const newCommandes = commandesEnAttente.filter(
      c => !lastNotifiedIds.has(c.id) && 
           !previousCommandesRef.current.some(prev => prev.id === c.id)
    );

    // Mettre à jour le compteur
    setPendingCount(commandesEnAttente.length);

    // Notifier les nouvelles commandes
    if (newCommandes.length > 0 && soundEnabled) {
      playNotificationSound();
      
      // Callback optionnel
      if (onNewOrder) {
        newCommandes.forEach(c => onNewOrder(c));
      }

      // Notification navigateur si disponible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nouvelle commande !', {
          body: `${newCommandes.length} nouvelle(s) commande(s) en attente`,
          icon: '/favicon.ico',
          tag: 'new-order',
        });
      }
    }

    // Mettre à jour les références
    previousCommandesRef.current = commandes;

    // Configurer la répétition automatique si des commandes sont en attente
    if (autoRepeat && commandesEnAttente.length > 0 && soundEnabled) {
      if (!repeatIntervalRef.current) {
        repeatIntervalRef.current = setInterval(() => {
          playNotificationSound(2); // Moins de beeps pour la répétition
        }, AUTO_REPEAT_INTERVAL);
      }
    } else if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }

    return () => {
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
      }
    };
  }, [commandes, soundEnabled, lastNotifiedIds, autoRepeat, playNotificationSound, onNewOrder]);

  // Demander la permission pour les notifications navigateur
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // État
    soundEnabled,
    hasPermission,
    pendingCount,
    
    // Actions
    toggleSound,
    enableSound,
    playNotificationSound,
    playUrgentSound,
    testSound,
    markAsNotified,
    clearNotifications,
  };
}

export default useOrderNotifications;