// // routes/packages.js
// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// // ====================================
// // GET ALL PACKAGES
// // ====================================
// router.get("/", (req, res) => {
//   // If you have a packages table
//   const sql = `
//     SELECT * FROM packages
//     ORDER BY id DESC
//   `;

//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error fetching packages:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(results);
//   });
// });

// // ====================================
// // GET SINGLE PACKAGE
// // ====================================
// router.get("/:id", (req, res) => {
//   const sql = `
//     SELECT * FROM packages
//     WHERE id = ?
//   `;

//   db.query(sql, [req.params.id], (err, result) => {
//     if (err) {
//       console.error('Error fetching package:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     if (result.length === 0) {
//       return res.status(404).json({ message: "Package not found" });
//     }
//     res.json(result[0]);
//   });
// });

// module.exports = router;




// routes/packages.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ====================================
// HELPER: GET PACKAGE IMAGES
// ====================================
function getPackageImages(packageId, callback) {
  db.query(
    `
      SELECT image_url 
      FROM package_images 
      WHERE package_id = ? 
      ORDER BY sort_order ASC, id ASC
    `,
    [packageId],
    (err, results) => {
      if (err) {
        console.error("Error fetching package images:", err);
        return callback(err, null);
      }
      const images = results.map(row => row.image_url);
      callback(null, images);
    }
  );
}

// ====================================
// HELPER: GET PACKAGES WITH IMAGES
// ====================================
function getPackagesWithImages(sql, params, callback) {
  db.query(sql, params, (err, packages) => {
    if (err) {
      console.error("Error fetching packages:", err);
      return callback(err, null);
    }

    if (!packages || packages.length === 0) {
      return callback(null, []);
    }

    let completed = 0;
    const results = [];

    packages.forEach((pkg, index) => {
      getPackageImages(pkg.id, (imgErr, images) => {
        if (imgErr) {
          console.error("Error fetching images for package:", pkg.id, imgErr.message);
        }
        pkg.images = images || [];
        
        // Parse JSON fields if they're strings
        if (pkg.includes && typeof pkg.includes === 'string') {
          try {
            pkg.includes = JSON.parse(pkg.includes);
          } catch (e) {
            pkg.includes = [];
          }
        }
        if (pkg.catering && typeof pkg.catering === 'string') {
          try {
            pkg.catering = JSON.parse(pkg.catering);
          } catch (e) {
            pkg.catering = [];
          }
        }
        if (pkg.stage_decoration && typeof pkg.stage_decoration === 'string') {
          try {
            pkg.stage_decoration = JSON.parse(pkg.stage_decoration);
          } catch (e) {
            pkg.stage_decoration = [];
          }
        }
        if (pkg.flower_decoration && typeof pkg.flower_decoration === 'string') {
          try {
            pkg.flower_decoration = JSON.parse(pkg.flower_decoration);
          } catch (e) {
            pkg.flower_decoration = [];
          }
        }
        if (pkg.lighting && typeof pkg.lighting === 'string') {
          try {
            pkg.lighting = JSON.parse(pkg.lighting);
          } catch (e) {
            pkg.lighting = [];
          }
        }
        if (pkg.sound_system && typeof pkg.sound_system === 'string') {
          try {
            pkg.sound_system = JSON.parse(pkg.sound_system);
          } catch (e) {
            pkg.sound_system = [];
          }
        }
        if (pkg.photography && typeof pkg.photography === 'string') {
          try {
            pkg.photography = JSON.parse(pkg.photography);
          } catch (e) {
            pkg.photography = [];
          }
        }
        if (pkg.videography && typeof pkg.videography === 'string') {
          try {
            pkg.videography = JSON.parse(pkg.videography);
          } catch (e) {
            pkg.videography = [];
          }
        }

        results[index] = pkg;
        completed++;

        if (completed === packages.length) {
          callback(null, results);
        }
      });
    });
  });
}

// ====================================
// GET ALL PACKAGES
// ====================================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      p.*
    FROM packages p
    WHERE p.is_active = 1
    ORDER BY p.id DESC
  `;

  getPackagesWithImages(sql, [], (err, results) => {
    if (err) {
      console.error('Error fetching packages:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET PACKAGES BY TIER
// ====================================
router.get("/tier/:tier", (req, res) => {
  const { tier } = req.params;

  const sql = `
    SELECT 
      p.*
    FROM packages p
    WHERE p.tier = ? AND p.is_active = 1
    ORDER BY p.price ASC
  `;

  getPackagesWithImages(sql, [tier], (err, results) => {
    if (err) {
      console.error('Error fetching packages by tier:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ====================================
// GET SINGLE PACKAGE
// ====================================
router.get("/:id", (req, res) => {
  const sql = `
    SELECT 
      p.*
    FROM packages p
    WHERE p.id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error fetching package:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }

    const pkg = result[0];

    // Parse JSON fields
    if (pkg.includes && typeof pkg.includes === 'string') {
      try {
        pkg.includes = JSON.parse(pkg.includes);
      } catch (e) {
        pkg.includes = [];
      }
    }
    if (pkg.catering && typeof pkg.catering === 'string') {
      try {
        pkg.catering = JSON.parse(pkg.catering);
      } catch (e) {
        pkg.catering = [];
      }
    }
    if (pkg.stage_decoration && typeof pkg.stage_decoration === 'string') {
      try {
        pkg.stage_decoration = JSON.parse(pkg.stage_decoration);
      } catch (e) {
        pkg.stage_decoration = [];
      }
    }
    if (pkg.flower_decoration && typeof pkg.flower_decoration === 'string') {
      try {
        pkg.flower_decoration = JSON.parse(pkg.flower_decoration);
      } catch (e) {
        pkg.flower_decoration = [];
      }
    }
    if (pkg.lighting && typeof pkg.lighting === 'string') {
      try {
        pkg.lighting = JSON.parse(pkg.lighting);
      } catch (e) {
        pkg.lighting = [];
      }
    }
    if (pkg.sound_system && typeof pkg.sound_system === 'string') {
      try {
        pkg.sound_system = JSON.parse(pkg.sound_system);
      } catch (e) {
        pkg.sound_system = [];
      }
    }
    if (pkg.photography && typeof pkg.photography === 'string') {
      try {
        pkg.photography = JSON.parse(pkg.photography);
      } catch (e) {
        pkg.photography = [];
      }
    }
    if (pkg.videography && typeof pkg.videography === 'string') {
      try {
        pkg.videography = JSON.parse(pkg.videography);
      } catch (e) {
        pkg.videography = [];
      }
    }

    // Get images
    getPackageImages(pkg.id, (imgErr, images) => {
      if (imgErr) {
        console.error("Error fetching package images:", imgErr);
        pkg.images = [];
      } else {
        pkg.images = images || [];
      }
      res.json(pkg);
    });
  });
});

// ====================================
// GET PACKAGE IMAGES ONLY
// ====================================
router.get("/:id/images", (req, res) => {
  const packageId = req.params.id;

  db.query(
    "SELECT id FROM packages WHERE id = ?",
    [packageId],
    (err, result) => {
      if (err) {
        console.error("Error checking package:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Package not found" });
      }

      getPackageImages(packageId, (imgErr, images) => {
        if (imgErr) {
          console.error("Error fetching package images:", imgErr);
          return res.status(500).json({ error: imgErr.message });
        }
        res.json({ images });
      });
    }
  );
});

module.exports = router;