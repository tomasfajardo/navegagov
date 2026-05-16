const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: 'artifacts/videos',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();

  try {
    console.log('Navigating to SNS24...');
    await page.goto('https://www.sns24.gov.pt/pt/inicio', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000); // Wait for micro-frontends to load

    console.log('Starting simulation...');
    
    // Smooth scroll down
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(500);
    }
    
    // Smooth scroll back up
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(500);
    }

    // Try to find the "Área Reservada" button in the header
    const reservedArea = page.locator('header').getByText(/Área Reservada|Entrar|Login/i).first();
    if (await reservedArea.isVisible()) {
      console.log('Found Reserved Area button, hovering...');
      const box = await reservedArea.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      }
      await reservedArea.hover();
      await page.waitForTimeout(2000);
    }

    // Look for service cards
    const services = page.getByText(/Marcação de Consultas|Consultas/i).first();
    if (await services.isVisible()) {
      console.log('Found Consultation service, hovering...');
      await services.scrollIntoViewIfNeeded();
      await services.hover();
      await page.waitForTimeout(3000);
      
      // Move mouse in circles around it
      const box = await services.boundingBox();
      if (box) {
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const x = box.x + box.width / 2 + Math.cos(angle) * 50;
          const y = box.y + box.height / 2 + Math.sin(angle) * 50;
          await page.mouse.move(x, y, { steps: 5 });
        }
      }
    }

    // Final wait to ensure video is long enough
    console.log('Wrapping up...');
    await page.waitForTimeout(5000);

  } catch (err) {
    console.error('Error during simulation:', err);
  } finally {
    await context.close();
    await browser.close();
  }

  // Get the video file
  const videoFiles = fs.readdirSync('artifacts/videos').filter(f => f.endsWith('.webm'));
  // Sort by mtime to get the latest
  videoFiles.sort((a, b) => {
    return fs.statSync(path.join('artifacts/videos', b)).mtime.getTime() - 
           fs.statSync(path.join('artifacts/videos', a)).mtime.getTime();
  });

  if (videoFiles.length > 0) {
    const latestVideo = videoFiles[0];
    const videoPath = path.join('artifacts/videos', latestVideo);
    console.log('Latest video:', videoPath);

    const fileName = `sns24_tutorial_${Date.now()}.webm`;
    const videoBuffer = fs.readFileSync(videoPath);

    console.log('Uploading to Supabase...');
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBuffer, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log('Public URL:', publicUrl);

    // Update database
    console.log('Updating database...');
    const sns24PlatformId = '2bf93564-545d-47dc-b323-ff99d9e4e202';
    
    // We update the existing one if possible or insert a new one with a better title
    const { error: dbError } = await supabase
      .from('tutoriais')
      .insert([
        {
          titulo: 'Guia Visual: Marcação de Consultas SNS24',
          descricao: 'Demonstração detalhada de como navegar no portal SNS24 para agendar a sua consulta.',
          video_url: publicUrl,
          tipo: 'video',
          conteudo_url: publicUrl,
          plataforma_id: sns24PlatformId,
          nivel: 'iniciante',
          duracao_min: 1
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
    } else {
      console.log('Tutorial successfully added!');
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
