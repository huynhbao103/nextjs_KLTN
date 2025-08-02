import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  image: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  allergies: {
    type: [String]
  },
  medicalConditions: {
    type: [String]
  },
  lastUpdateDate: {
    type: Date,
    default: Date.now
  },
  providers: {
    type: [String],
    default: []
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
})

// Tính tuổi từ ngày sinh
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
})

// Kiểm tra xem dữ liệu có cần cập nhật không
userSchema.methods.needsUpdate = function() {
  if (!this.lastUpdateDate) return true
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1)
  
  return this.lastUpdateDate < thirtyDaysAgo
}

// Safe model creation for Next.js
let User: mongoose.Model<any>

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  try {
    // Check if model already exists
    User = mongoose.models.User
    if (!User) {
      // Model doesn't exist, create it
      User = mongoose.model('User', userSchema)
    }
  } catch (error) {
    console.error('Error initializing User model:', error)
    // Create a fallback model
    User = mongoose.model('User', userSchema)
  }
} else {
  // In browser environment, create a dummy model
  User = {} as mongoose.Model<any>
}

export default User 