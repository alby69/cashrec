export const APP_MODE = window.__CASHREC_MODE__ || 'web';
export const APP_VERSION = '6.0.0';

export const MODE_CONFIGS = {
    standalone: {
        badgeText: '100% Client-Side',
        versionLabel: `v${APP_VERSION} Standalone HTML App — 100% Client-Side & Privacy First`,
        pdfFooter: 'Generato con CashRec Standalone App • 100% Client-Side'
    },
    web: {
        badgeText: 'Render Web App',
        versionLabel: `v${APP_VERSION} Web App — Render Dual Mode`,
        pdfFooter: 'Generato con CashRec Web App • 100% Client-Side'
    }
};

export const CURRENT_MODE_CONFIG = MODE_CONFIGS[APP_MODE] || MODE_CONFIGS.web;

export const DEFAULT_CONFIG = {
    common: {
        algorithm: "progressive_balance",
        tolerance: 50.0,
        days_window: 5,
        search_direction: "past_only",
        max_combinations: 10,
        residual_threshold: 50.0,
        residual_days_window: 5,
        handover_days: 5,
        column_mapping: {
            "Data Reg.": "Date",
            "Dare": "Debit",
            "Avere": "Credit"
        }
    }
};

export const DEFAULT_PROFILES = {
    "Operatore Punto Vendita (Default)": {
        algorithm: "progressive_balance",
        days_window: 5,
        tolerance: 50.0,
        search_direction: "past_only",
        max_combinations: 10,
        residual_threshold: 50.0,
        residual_days_window: 5,
        handover_days: 5
    },
    "Riconciliazione Mensile Fine Anno": {
        algorithm: "subset_sum",
        days_window: 15,
        tolerance: 1.0,
        search_direction: "both",
        max_combinations: 10,
        residual_threshold: 50.0,
        residual_days_window: 30
    },
    "Greedy Importi Elevati": {
        algorithm: "greedy_amount_first",
        days_window: 15,
        tolerance: 50.0,
        search_direction: "both",
        max_combinations: 10,
        residual_threshold: 50.0,
        residual_days_window: 5
    }
};

export const I18N_TRANSLATIONS = {
    it: {
        dropzone_title: "Trascina qui i tuoi file Excel o CSV",
        dropzone_sub: "supporta formati .xlsx, .xls, .csv (singolo o multi-file)",
        advanced_toggle: "Impostazioni Avanzate",
        btn_process: "Elabora File",
        btn_download_excel: "Scarica Report Excel",
        btn_download_pdf: "Scarica Report PDF",
        btn_new_file: "Nuovo File"
    },
    en: {
        dropzone_title: "Drag & drop your Excel or CSV files here",
        dropzone_sub: "supports .xlsx, .xls, .csv formats (single or multi-file)",
        advanced_toggle: "Advanced Settings",
        btn_process: "Process File",
        btn_download_excel: "Download Excel Report",
        btn_download_pdf: "Download PDF Report",
        btn_new_file: "New File"
    }
};
