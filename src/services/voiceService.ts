// Voice Service for ShelfSense - Voice Search and Commands

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export interface VoiceSearchResult {
  query: string;
  results: any[];
  confidence: number;
}

class VoiceService {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private isProcessing = false;
  private commands: VoiceCommand[] = [];
  private onResultCallback: ((result: VoiceSearchResult) => void) | null = null;
  private onCommandCallback: ((command: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
    this.setupDefaultCommands();
  }

  private initializeSpeechRecognition() {
    try {
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new (window as any).SpeechRecognition();
      }

      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.isProcessing = false;
          this.retryCount = 0;
          if (this.onStatusCallback) {
            this.onStatusCallback('listening');
          }
        };

        this.recognition.onresult = (event: any) => {
          this.isProcessing = true;
          if (this.onStatusCallback) {
            this.onStatusCallback('processing');
          }

          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript.toLowerCase().trim();
          const confidence = result[0].confidence || 0.8;
          const isFinal = result.isFinal;

          console.log('Voice input:', transcript, 'Confidence:', confidence, 'Final:', isFinal);

          if (isFinal && confidence > 0.6) {
            // Check if it's a command first
            const matchedCommand = this.matchCommand(transcript);
            if (matchedCommand) {
              this.speak(`Executing ${matchedCommand.description}`);
              setTimeout(() => {
                matchedCommand.action();
                if (this.onCommandCallback) {
                  this.onCommandCallback(transcript);
                }
              }, 500);
            } else {
              // Treat as search query
              this.performVoiceSearch(transcript, confidence);
            }
          } else if (isFinal && confidence <= 0.6) {
            this.handleLowConfidence(transcript, confidence);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
          this.isProcessing = false;
          
          const errorMessage = this.getErrorMessage(event.error);
          if (this.onErrorCallback) {
            this.onErrorCallback(errorMessage);
          }
          
          this.handleRecognitionError(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.isProcessing = false;
          if (this.onStatusCallback) {
            this.onStatusCallback('idle');
          }
        };
      }
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition initialization failed');
      }
    }
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try speaking again.';
      case 'audio-capture':
        return 'Microphone not accessible. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access denied. Please enable microphone permissions.';
      case 'network':
        return 'Network error. Please check your internet connection.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      default:
        return `Speech recognition error: ${error}`;
    }
  }

  private handleRecognitionError(error: string) {
    if (error === 'no-speech' && this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.speak('I didn\'t hear anything. Please try again.');
      setTimeout(() => {
        if (!this.isListening) {
          this.startListening();
        }
      }, 1000);
    } else if (error === 'not-allowed') {
      this.speak('Microphone access denied. Please enable microphone permissions in your browser settings.');
    } else {
      this.speak(this.getErrorMessage(error));
    }
  }

  private handleLowConfidence(transcript: string, confidence: number) {
    this.speak(`I heard "${transcript}" but I'm not confident. Did you mean that? Please try speaking more clearly.`);
    console.warn('Low confidence speech:', transcript, confidence);
  }

  private setupDefaultCommands() {
    this.commands = [
      // Navigation Commands
      {
        command: 'go to inventory',
        action: () => this.navigateToSection('inventory'),
        description: 'navigate to inventory section'
      },
      {
        command: 'go to sales',
        action: () => this.navigateToSection('sales'),
        description: 'navigate to sales section'
      },
      {
        command: 'go to dashboard',
        action: () => this.navigateToSection('dashboard'),
        description: 'navigate to dashboard'
      },
      {
        command: 'go to suppliers',
        action: () => this.navigateToSection('suppliers'),
        description: 'navigate to suppliers section'
      },
      {
        command: 'go to analytics',
        action: () => this.navigateToSection('analytics'),
        description: 'navigate to analytics section'
      },
      {
        command: 'show alerts',
        action: () => this.navigateToSection('alerts'),
        description: 'show alerts section'
      },
      {
        command: 'go to reports',
        action: () => this.navigateToSection('reports'),
        description: 'navigate to reports section'
      },
      {
        command: 'go to settings',
        action: () => this.navigateToSection('settings'),
        description: 'navigate to settings'
      },
      {
        command: 'go to purchase orders',
        action: () => this.navigateToSection('purchase'),
        description: 'navigate to purchase orders'
      },
      {
        command: 'go to corrosion detection',
        action: () => this.navigateToSection('corrosion'),
        description: 'navigate to corrosion detection'
      },
      {
        command: 'check freshness',
        action: () => this.navigateToSection('corrosion'),
        description: 'check product freshness'
      },
      
      // Action Commands
      {
        command: 'new sale',
        action: () => this.triggerNewSale(),
        description: 'create new sale'
      },
      {
        command: 'add product',
        action: () => this.triggerAddProduct(),
        description: 'add new product'
      },
      {
        command: 'add supplier',
        action: () => this.triggerAddSupplier(),
        description: 'add new supplier'
      },
      {
        command: 'scan barcode',
        action: () => this.triggerBarcodeScan(),
        description: 'open barcode scanner'
      },
      {
        command: 'scan for corrosion',
        action: () => this.triggerCorrosionScan(),
        description: 'start corrosion detection scan'
      },
      {
        command: 'batch scan products',
        action: () => this.triggerBatchScan(),
        description: 'scan multiple products for freshness'
      },
      {
        command: 'initialize hardware',
        action: () => this.triggerHardwareInit(),
        description: 'initialize corrosion detection hardware'
      },
      
      // Sorting Commands
      {
        command: 'sort by name',
        action: () => this.triggerSort('name'),
        description: 'sort products by name'
      },
      {
        command: 'sort by price',
        action: () => this.triggerSort('price'),
        description: 'sort products by price'
      },
      {
        command: 'sort by expiry',
        action: () => this.triggerSort('expiry'),
        description: 'sort products by expiry date'
      },
      {
        command: 'sort by stock',
        action: () => this.triggerSort('stock'),
        description: 'sort products by stock level'
      },
      
      // Filter Commands
      {
        command: 'show expiring products',
        action: () => this.filterProducts('expiring'),
        description: 'show expiring products'
      },
      {
        command: 'show low stock',
        action: () => this.filterProducts('low-stock'),
        description: 'show low stock products'
      },
      {
        command: 'show all products',
        action: () => this.filterProducts('all'),
        description: 'show all products'
      },
      {
        command: 'show out of stock',
        action: () => this.filterProducts('out-of-stock'),
        description: 'show out of stock products'
      },
      
      // Voice Control Commands
      {
        command: 'help',
        action: () => this.speakHelp(),
        description: 'show available voice commands'
      },
      {
        command: 'stop listening',
        action: () => this.stopListening(),
        description: 'stop voice recognition'
      },
      {
        command: 'repeat',
        action: () => this.repeatLastAction(),
        description: 'repeat last voice command'
      },
      
      // Quick Actions
      {
        command: 'refresh data',
        action: () => this.triggerRefresh(),
        description: 'refresh current data'
      },
      {
        command: 'export data',
        action: () => this.triggerExport(),
        description: 'export current data'
      }
    ];
  }

  private matchCommand(transcript: string): VoiceCommand | null {
    return this.commands.find(cmd => 
      transcript.includes(cmd.command) || 
      this.fuzzyMatch(transcript, cmd.command)
    ) || null;
  }

  private fuzzyMatch(input: string, command: string): boolean {
    const words = command.split(' ');
    return words.every(word => input.includes(word));
  }

  private async performVoiceSearch(query: string, confidence: number) {
    try {
      // Clean up the query
      const cleanQuery = this.cleanSearchQuery(query);
      
      // Perform API search - use same base URL as apiService
      const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/voice/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery })
      });

      const data = await response.json();
      
      if (data.success) {
        const result: VoiceSearchResult = {
          query: cleanQuery,
          results: data.data,
          confidence
        };

        if (this.onResultCallback) {
          this.onResultCallback(result);
        }

        // Provide voice feedback
        if (data.data.length > 0) {
          this.speak(`Found ${data.data.length} products matching "${cleanQuery}"`);
        } else {
          this.speak(`No products found for "${cleanQuery}". Try a different search term.`);
        }
      }
    } catch (error) {
      console.error('Voice search error:', error);
      this.speak('Search failed. Please try again.');
    }
  }

  private cleanSearchQuery(query: string): string {
    // Remove common voice search prefixes
    const prefixes = [
      'search for', 'find', 'show me', 'look for', 'get me',
      'i want', 'i need', 'where is', 'do you have'
    ];
    
    let cleaned = query.toLowerCase();
    for (const prefix of prefixes) {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
        break;
      }
    }
    
    return cleaned;
  }

  private navigateToSection(section: string) {
    window.dispatchEvent(new CustomEvent('voice-navigate', { 
      detail: { section } 
    }));
  }

  private triggerNewSale() {
    window.dispatchEvent(new CustomEvent('voice-new-sale'));
  }

  private triggerAddProduct() {
    window.dispatchEvent(new CustomEvent('voice-add-product'));
  }

  private triggerAddSupplier() {
    window.dispatchEvent(new CustomEvent('voice-add-supplier'));
  }

  private triggerBarcodeScan() {
    window.dispatchEvent(new CustomEvent('voice-barcode-scan'));
  }

  private triggerCorrosionScan() {
    window.dispatchEvent(new CustomEvent('voice-corrosion-scan'));
    this.speak('Starting corrosion detection scan');
  }

  private triggerBatchScan() {
    window.dispatchEvent(new CustomEvent('voice-batch-scan'));
    this.speak('Starting batch scan for freshness detection');
  }

  private triggerHardwareInit() {
    window.dispatchEvent(new CustomEvent('voice-hardware-init'));
    this.speak('Initializing hardware for corrosion detection');
  }

  private triggerSort(sortBy: string) {
    window.dispatchEvent(new CustomEvent('voice-sort', { 
      detail: { sortBy } 
    }));
  }

  private filterProducts(filter: string) {
    window.dispatchEvent(new CustomEvent('voice-filter', { 
      detail: { filter } 
    }));
  }

  private lastAction: (() => void) | null = null;

  private repeatLastAction() {
    if (this.lastAction) {
      this.speak('Repeating last action');
      this.lastAction();
    } else {
      this.speak('No previous action to repeat');
    }
  }

  private triggerRefresh() {
    window.dispatchEvent(new CustomEvent('voice-refresh'));
    this.speak('Refreshing data');
  }

  private triggerExport() {
    window.dispatchEvent(new CustomEvent('voice-export'));
    this.speak('Exporting data');
  }

  // Public methods
  startListening(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.recognition) {
        this.speak('Voice recognition not supported in this browser.');
        resolve(false);
        return;
      }

      if (this.isListening) {
        resolve(true);
        return;
      }

      try {
        this.isListening = true;
        this.recognition.start();
        this.speak('Listening... You can say commands like "search for apples" or "go to inventory"');
        resolve(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        this.isListening = false;
        resolve(false);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string) {
    if (this.synthesis) {
      // Cancel any ongoing speech
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      this.synthesis.speak(utterance);
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getIsProcessing(): boolean {
    return this.isProcessing;
  }

  onSearchResult(callback: (result: VoiceSearchResult) => void) {
    this.onResultCallback = callback;
  }

  onCommand(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  onStatus(callback: (status: string) => void) {
    this.onStatusCallback = callback;
  }

  getAvailableCommands(): VoiceCommand[] {
    return [...this.commands];
  }

  addCustomCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  // Voice-guided tutorial
  startVoiceTutorial() {
    const tutorial = [
      "Welcome to ShelfSense voice assistant!",
      "You can use voice commands to navigate and search.",
      "Try saying: Search for apples, Go to inventory, or New sale.",
      "For sorting, say: Sort by price, Sort by name, or Sort by expiry.",
      "To filter products, say: Show expiring products or Show low stock.",
      "Say 'help' anytime to hear available commands."
    ];

    let index = 0;
    const speakNext = () => {
      if (index < tutorial.length) {
        this.speak(tutorial[index]);
        index++;
        setTimeout(speakNext, 3000);
      }
    };

    speakNext();
  }

  // Help command
  speakHelp() {
    const helpText = `Available voice commands: 
    Navigation: Go to inventory, Go to sales, Go to dashboard. 
    Search: Search for product name, like "search for apples". 
    Actions: New sale, Add product. 
    Sorting: Sort by name, Sort by price, Sort by expiry, Sort by stock. 
    Filtering: Show expiring products, Show low stock, Show all products.`;
    
    this.speak(helpText);
  }
}

export const voiceService = new VoiceService();
export default voiceService;
