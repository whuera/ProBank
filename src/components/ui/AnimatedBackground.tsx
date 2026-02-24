'use client';

import React, { useEffect, useRef } from 'react';
import styles from './AnimatedBackground.module.css';

export const AnimatedBackground: React.FC = () => {
    return (
        <div className={styles.backgroundContainer}>
            {/* Solo se muestra el contenedor del fondo sin efectos superpuestos */}
        </div>
    );
};
