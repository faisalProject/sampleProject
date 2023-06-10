import { Component, OnInit } from '@angular/core';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';
import { LocationService } from '../service/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  readerMode$: any;

  
  constructor(private nfc: NFC, private ndef: Ndef, private geoLocationService: LocationService ) { }

  async checkNFC() {
    let flags = this.nfc.FLAG_READER_NFC_A | this.nfc.FLAG_READER_NFC_V;
    this.readerMode$ = this.nfc.readerMode(flags).subscribe(
     tag => console.log(JSON.stringify(tag)),
     err => console.log('Error reading tag', err)
  );

// Read NFC Tag - iOS
// On iOS, a NFC reader session takes control from your app while scanning tags then returns a tag
    try {
        let tag = await this.nfc.scanNdef();
        console.log(JSON.stringify(tag));
    } catch (err) {
        console.log('Error reading tag', err);
    }
  }

  async getLocation() {
    const positition = await this.geoLocationService.getLocation();
    const { latitude, longitude, accuracy } = positition.coords;

    // get address
    const getAddress = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const address = await getAddress.json();

    return address;
  }

  async sendTelegramNotification(message: string) {
    // Ganti <YOUR_BOT_TOKEN> dengan token bot Telegram Anda
    const botToken = 'faisal22929';
    // Ganti <YOUR_CHAT_ID> dengan ID chat Anda di Telegram
    const chatId = '<YOUR_CHAT_ID>';
  
    // Mengirim permintaan HTTP ke API Bot Telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const params = {
      chat_id: chatId,
      text: message
    };
  
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      console.log('Notifikasi berhasil dikirim ke Telegram');
    } catch (error) {
      console.error('Gagal mengirim notifikasi ke Telegram:', error);
    }
  }

  async handleNFCTag(tag: any) {
    // Mengambil data dari tag NFC
    const tagData = tag.ndefMessage[0].payload;
  
    // Melakukan konversi byte array menjadi string
    const message = this.ndef.textHelper.decodePayload(tagData);
  
    try {
      // Mengambil lokasi
      const address = await this.getLocation();
  
      // Membuat pesan yang akan dikirim ke Telegram
      const locationMessage = `Lokasi: ${address.display_name}\nTag NFC: ${message}`;
  
      // Mengirim notifikasi ke Telegram
      await this.sendTelegramNotification(locationMessage);
    } catch (error) {
      console.error('Gagal mendapatkan lokasi atau mengirim notifikasi ke Telegram:', error);
    }
  }
  

  ngOnInit() {
  }

}
