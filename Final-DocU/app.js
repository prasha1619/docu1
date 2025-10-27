console.log('🔵 App.js started loading...');

// Check if Supabase library is loaded
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase library not loaded!');
} else {
  console.log('✅ Supabase library loaded successfully!');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM Content Loaded!');

  // Get all elements
  const signupModal = document.getElementById('signup-modal');
  const loginModal = document.getElementById('login-modal');
  const signupBtn = document.getElementById('signup-btn');
  const loginBtn = document.getElementById('login-btn');
  const heroSignupBtn = document.getElementById('hero-signup');
  const closeSignup = document.getElementById('close-signup');
  const closeLogin = document.getElementById('close-login');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const signupMessage = document.getElementById('signup-message');
  const loginMessage = document.getElementById('login-message');

  // Open Signup Modal
  if (signupBtn) {
    signupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎯 Signup button clicked!');
      signupModal.classList.remove('hidden');
    });
  }

  if (heroSignupBtn) {
    heroSignupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎯 Hero signup button clicked!');
      signupModal.classList.remove('hidden');
    });
  }

  // Open Login Modal
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎯 Login button clicked!');
      loginModal.classList.remove('hidden');
    });
  }

  // Close Modals
  if (closeSignup) {
    closeSignup.addEventListener('click', function() {
      console.log('❌ Close signup clicked');
      signupModal.classList.add('hidden');
      if (signupMessage) signupMessage.textContent = '';
    });
  }

  if (closeLogin) {
    closeLogin.addEventListener('click', function() {
      console.log('❌ Close login clicked');
      loginModal.classList.add('hidden');
      if (loginMessage) loginMessage.textContent = '';
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === signupModal) {
      signupModal.classList.add('hidden');
      if (signupMessage) signupMessage.textContent = '';
    }
    if (e.target === loginModal) {
      loginModal.classList.add('hidden');
      if (loginMessage) loginMessage.textContent = '';
    }
  });

  // ============================================
  // SIGNUP FUNCTIONALITY
  // ============================================
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Signup form submitted!');

      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const specialization = document.getElementById('signup-bloodgroup').value.trim();
      
      const password = document.getElementById('signup-password').value;
      const role = document.getElementById('signup-role').value;

      console.log('Form values:', { name, email, password: '*', role });

      // Validation
      if (!name || !email || !password || !role || !specialization) {
        signupMessage.textContent = '❌ Please fill all fields';
        signupMessage.style.color = 'red';
        return;
      }

      if (password.length < 6) {
        signupMessage.textContent = '❌ Password must be at least 6 characters';
        signupMessage.style.color = 'red';
        return;
      }

      signupMessage.textContent = '⏳ Creating account...';
      signupMessage.style.color = 'blue';

      try {
        // Step 1: Create auth user
        console.log('🔄 Step 1: Creating auth user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              specialization: specialization,
              role: role
            }
          }
        });

        if (authError) {
          console.error('❌ Auth error:', authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error('No user returned from signup');
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Step 2: Add to doctor's or patient's table (NO users table!)
        if (role === 'doctor') {
          console.log('🔄 Step 2: Adding to doctors table...');
          const { error: doctorError } = await supabase
            .from('doctors')
            .insert([{
              user_id: authData.user.id,
              name: name,
              email: email,
              specialization: specialization,
              appointments: [],
              schedule: []
            }]);

          if (doctorError) {
            console.error('❌ Error saving doctor:', doctorError);
            throw doctorError;
          }
          console.log('✅ Doctor profile created');

        } else if (role === 'patient') {
          console.log('🔄 Step 2: Adding to patients table...');
          const { error: patientError } = await supabase
            .from('patients')
            .insert([{
              user_id: authData.user.id,
              name: name,
              email: email,
              specialization: specialization,
              medical_history: [],
              appointments: [],
              prescriptions: []
            }]);

          if (patientError) {
            console.error('❌ Error saving patient:', patientError);
            throw patientError;
          }
          console.log('✅ Patient profile created');
        }

        signupMessage.textContent = '✅ Signup successful! Please log in.';
        signupMessage.style.color = 'green';

        // Clear form and switch to login modal
        signupForm.reset();
        setTimeout(() => {
          signupModal.classList.add('hidden');
          loginModal.classList.remove('hidden');
          signupMessage.textContent = '';
        }, 2000);

      } catch (error) {
        console.error('❌ Signup error:', error);
        signupMessage.textContent = '❌ ' + error.message;
        signupMessage.style.color = 'red';
      }
    });
  }

  // ============================================
  // LOGIN FUNCTIONALITY
  // ============================================
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Login form submitted!');

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) {
        loginMessage.textContent = '❌ Please fill all fields';
        loginMessage.style.color = 'red';
        return;
      }

      loginMessage.textContent = '⏳ Logging in...';
      loginMessage.style.color = 'blue';

      try {
        // Step 1: Sign in with Supabase Auth
        console.log('🔄 Step 1: Signing in...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
          
        });

        if (authError) {
          console.error('❌ Login error:', authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error('Login failed - no user returned');
        }

        console.log('✅ Signed in:', authData.user.id);

        // Step 2: Check if user is a doctor (NO users table!)
        console.log('🔄 Step 2: Checking doctors table...');
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (doctorData && !doctorError) {
          console.log('✅ Found doctor profile:', doctorData);
          loginMessage.textContent = '✅ Welcome Dr. ' + doctorData.name  + '!';
          loginMessage.style.color = 'green';

          // Save to localStorage
          localStorage.setItem('user', JSON.stringify({
            id: authData.user.id,
            email: doctorData.email,
            name: doctorData.name,
            specialization : doctorData.specialization,
            role: 'doctor'
          }));

          // Redirect to doctor dashboard
          setTimeout(() => {
            window.location.href = 'doctor-dashboard.html';
          }, 1000);
          return;
        }

        // Step 3: Check if user is a patient
        console.log('🔄 Step 3: Checking patients table...');
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (patientData && !patientError) {
          console.log('✅ Found patient profile:', patientData);
          loginMessage.textContent = '✅ Welcome ' + patientData.specialization + '!';
          loginMessage.style.color = 'green';

          // Save to localStorage
          localStorage.setItem('user', JSON.stringify({
            id: authData.user.id,
            email: patientData.email,
            name: patientData.name,
            role: 'patient'
          }));

          // Redirect to patient dashboard
          setTimeout(() => {
            window.location.href = 'patient-dashboard.html';
          }, 1000);
          return;
        }

        // If we get here, user exists in auth but not in doctors or patients table
        throw new Error('Profile not found. Please contact support.');

      } catch (error) {
        console.error('❌ Login error:', error);
        loginMessage.textContent = '❌ ' + error.message;
        loginMessage.style.color = 'red';
      }
    });
  }

  console.log('✅ All event listeners setup complete!');
});

console.log('🔵 Script finished loading');