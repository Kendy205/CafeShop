using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.IService;

namespace CafeShop.Service.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _unitOfWork.User.GetAllAsync();
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _unitOfWork.User.GetFirstOrDefaultAsync(p=>p.UserId==id);
        }

        public async Task AddAsync(User entity)
        {
            await _unitOfWork.User.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(User entity)
        {
            _unitOfWork.User.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.User.GetFirstOrDefaultAsync(p=>p.UserId==id);
            if (entity != null)
            {
                _unitOfWork.User.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
