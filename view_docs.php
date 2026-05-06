<?php
/**
 * Sahibzada Gun House — Document Gallery Viewer
 * Displays captured documents for a specific user in a professional gallery.
 */

$user = isset($_GET['user']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '_', $_GET['user']) : '';
$dir = 'uploads/documents/' . $user . '/';

$images = [];
if ($user && is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if (in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png'])) {
            $images[] = $dir . $file;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Documents — <?php echo htmlspecialchars(str_replace('_', ' ', $user)); ?></title>
    <link rel="stylesheet" href="css/main.css">
    <style>
        body { background: #fdfbf3; padding: 2rem; min-height: 100vh; }
        .gallery-header { 
            max-width: 1000px; 
            margin: 0 auto 3rem; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 2px solid var(--emerald-900);
            padding-bottom: 1rem;
        }
        .gallery-grid { 
            max-width: 1000px; 
            margin: 0 auto; 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 2rem; 
        }
        .doc-card { 
            background: white; 
            border: 1px solid var(--ivory-300); 
            padding: 1rem; 
            border-radius: 8px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
        }
        .doc-card:hover { transform: translateY(-5px); }
        .doc-card img { 
            width: 100%; 
            height: auto; 
            border-radius: 4px; 
            cursor: pointer;
        }
        .doc-label { 
            margin-top: 1rem; 
            font-size: 0.75rem; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            color: var(--charcoal-500);
            font-weight: 700;
        }
        .back-btn {
            color: var(--emerald-900);
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .empty-state { text-align: center; padding: 5rem; color: #666; }
    </style>
</head>
<body>

    <header class="gallery-header">
        <div>
            <a href="admin.html" class="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Dashboard
            </a>
            <h1 style="margin-top: 1rem; font-family: 'Playfair Display', serif; color: var(--emerald-950);">
                Documents: <?php echo htmlspecialchars(str_replace('_', ' ', $user)); ?>
            </h1>
        </div>
        <img src="sahibzada_gun_house_logo.jpg" alt="Logo" style="height: 60px;">
    </header>

    <main>
        <?php if (empty($images)): ?>
            <div class="empty-state">
                <p>No documents found for this user.</p>
            </div>
        <?php else: ?>
            <div class="gallery-grid">
                <?php foreach ($images as $index => $img): ?>
                    <div class="doc-card">
                        <a href="<?php echo $img; ?>" target="_blank">
                            <img src="<?php echo $img; ?>" alt="Document <?php echo $index+1; ?>">
                        </a>
                        <div class="doc-label">Capture #<?php echo $index+1; ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>

</body>
</html>
