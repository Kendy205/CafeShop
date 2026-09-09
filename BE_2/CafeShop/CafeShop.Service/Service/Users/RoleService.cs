//using System.Collections.Generic;
//using System.Threading.Tasks;
//using AutoMapper;
//using CafeShop.Data.Repository.UnitOfWork;
//using CafeShop.Model;
//using CafeShop.Repositories.IRepository;
//using CafeShop.Services.IServices;

//namespace CafeShop.Services.Services
//{
//    public class RoleService : IRoleService
//    {
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly IMapper _mapper;

//        public RoleService(IUnitOfWork unitOfWork, IMapper mapper)
//        {
//            _unitOfWork = unitOfWork;
//            _mapper = mapper;
//        }

//        public async Task<IEnumerable<Role>> GetAllAsync()
//        {
//            return await _unitOfWork.Role.GetAllAsync();
//        }

//        public async Task<Role> GetByIdAsync(int id)
//        {
//            return await _unitOfWork.Role.GetByIdAsync(id);
//        }

//        public async Task AddAsync(Role entity)
//        {
//            await _unitOfWork.Role.AddAsync(entity);
//            await _unitOfWork.SaveAsync();
//        }

//        public async Task UpdateAsync(Role entity)
//        {
//            _unitOfWork.Role.Update(entity);
//            await _unitOfWork.SaveAsync();
//        }

//        public async Task DeleteAsync(int id)
//        {
//            var entity = await _unitOfWork.Role.GetByIdAsync(id);
//            if (entity != null)
//            {
//                _unitOfWork.Role.Remove(entity);
//                await _unitOfWork.SaveAsync();
//            }
//        }
//    }
//}
