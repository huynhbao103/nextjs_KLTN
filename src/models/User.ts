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

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User 