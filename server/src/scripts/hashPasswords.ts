/**
 * Migration Script: Hash Unhashed Passwords
 * 
 * Bu script, veritabanındaki hash'lenmemiş şifreleri hash'ler.
 * Sadece bir kez çalıştırılmalıdır.
 * 
 * Kullanım:
 *   npx ts-node src/scripts/hashPasswords.ts
 *   veya
 *   npm run migrate:hash-passwords
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { initializeDatabase } from '../config/firebase';

dotenv.config();

async function hashUnhashedPasswords() {
  try {
    console.log('🔄 Veritabanına bağlanılıyor...');
    await initializeDatabase();

    console.log('🔍 Hash\'lenmemiş şifreler aranıyor...');
    
    // Hash'lenmemiş şifreleri bul (bcrypt hash'leri $2 ile başlar)
    const usersWithUnhashedPasswords = await User.find({
      password: { $not: { $regex: /^\$2/ } }
    });

    if (usersWithUnhashedPasswords.length === 0) {
      console.log('✅ Tüm şifreler zaten hash\'lenmiş!');
      process.exit(0);
    }

    console.log(`📝 ${usersWithUnhashedPasswords.length} kullanıcının şifresi hash\'lenecek...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithUnhashedPasswords) {
      try {
        const plainPassword = user.password;
        
        // Şifreyi hash'le
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // Mongoose'un pre-save hook'unu bypass etmek için direkt update kullan
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`✅ ${user.email} - Şifre hash'lendi`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ ${user.email} - Hata:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Özet:');
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hata: ${errorCount}`);
    console.log(`📝 Toplam: ${usersWithUnhashedPasswords.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Tüm şifreler başarıyla hash\'lendi!');
    } else {
      console.log('\n⚠️  Bazı şifreler hash\'lenemedi. Lütfen hataları kontrol edin.');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Script'i çalıştır
hashUnhashedPasswords();
